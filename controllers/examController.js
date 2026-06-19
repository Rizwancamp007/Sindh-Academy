const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const mammoth = require('mammoth');

// @desc    Global text search across MCQ database with security filtering
// @route   GET /api/v1/exams/search-mcq
// @access  Private
exports.searchMCQ = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Find questions matching query
    const questions = await Question.find({ $text: { $search: q } });

    // Security check: locate active monthly exams student hasn't submitted yet
    const unpaidOrActiveExams = await Exam.find({
      $or: [
        { isDemo: false, windowClose: { $gt: Date.now() } } // Active monthly test
      ]
    });

    const activeExamQuestionIds = new Set();
    for (const exam of unpaidOrActiveExams) {
      // Check if student completed this exam
      const completedAttempt = req.user ? await Attempt.findOne({
        studentId: req.user.id,
        examId: exam._id,
        isCompleted: true
      }) : null;

      // If student hasn't completed it, lock its question keys
      if (!completedAttempt) {
        exam.questions.forEach((id) => activeExamQuestionIds.add(id.toString()));
      }
    }

    // Process questions output: hide key answers if locked
    const sanitizedQuestions = questions.map((q) => {
      const qObj = q.toObject();
      if (activeExamQuestionIds.has(qObj._id.toString())) {
        // Strip out the answer key and explanation
        delete qObj.correctOption;
        delete qObj.explanation;
        qObj.isLocked = true;
      } else {
        qObj.isLocked = false;
      }
      return qObj;
    });

    res.status(200).json({ success: true, questions: sanitizedQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get mock test sheet structure (strips answers)
// @route   GET /api/v1/exams/mocks/:id
// @access  Private / Public (Demo check)
exports.getMock = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Access control: demo vs premium
    let hasAccess = exam.isDemo;
    if (!hasAccess && req.user) {
      if (['admin', 'teacher'].includes(req.user.role) || req.user.isPaid) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access Denied: Premium mock assessment.' });
    }

    // Strict scheduled windows checks for monthly evaluations
    if (exam.isMonthly && exam.windowOpen && exam.windowClose) {
      const now = Date.now();
      if (now < new Date(exam.windowOpen).getTime()) {
        return res.status(403).json({ success: false, message: 'This evaluation window is not open yet.' });
      }
      if (now > new Date(exam.windowClose).getTime()) {
        return res.status(403).json({ success: false, message: 'This evaluation window is closed.' });
      }
    }

    // Check if student already submitted this
    if (req.user) {
      const existingAttempt = await Attempt.findOne({
        studentId: req.user.id,
        examId: exam._id,
        isCompleted: true
      });
      if (existingAttempt) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this exam.',
          score: existingAttempt.score,
          completedAt: existingAttempt.completedAt
        });
      }
    }

    // Strip answers from the payload returned to browser console
    const strippedQuestions = exam.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      subject: q.subject,
      topic: q.topic
    }));

    // Calculate remaining window countdown override (prevent cheating on window limits)
    let timeLimit = exam.durationMinutes; // in minutes
    if (exam.isMonthly && exam.windowClose) {
      const remainingWindowMin = Math.floor((new Date(exam.windowClose).getTime() - Date.now()) / 60000);
      if (remainingWindowMin < timeLimit) {
        timeLimit = remainingWindowMin; // Force match remaining time
      }
    }

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        isMonthly: exam.isMonthly,
        duration: timeLimit,
        negativeMarking: exam.negativeMarking,
        questions: strippedQuestions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit mock test answers
// @route   POST /api/v1/exams/mocks/submit
// @access  Private
exports.submitMock = async (req, res) => {
  try {
    const { examId, answers, flaggedQuestions } = req.body; // answers is an object/map: { [questionId]: 'A'/'B'/'C'/'D' }

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check duplicate submissions (only for authenticated users)
    if (req.user) {
      const existingAttempt = await Attempt.findOne({
        studentId: req.user.id,
        examId: exam._id,
        isCompleted: true
      });
      if (existingAttempt) {
        return res.status(400).json({ success: false, message: 'Exam already submitted' });
      }
    }

    // Grade attempt & calculate weak topics
    let score = 0;
    const gradedAnswers = [];
    const topicStats = {}; // { topicName: { correct: 0, total: 0, subject: '' } }

    exam.questions.forEach((q) => {
      const selectedOption = answers[q._id.toString()] || null; // student selection letter
      const isCorrect = selectedOption !== null && selectedOption === q.correctOption;

      if (isCorrect) {
        // Correct answers: MDCAT = +1, ECAT (negativeMarking) = +4
        score += exam.negativeMarking ? 4 : 1;
      } else if (selectedOption !== null) {
        // Wrong answers: MDCAT = 0, ECAT (negativeMarking) = -1
        if (exam.negativeMarking) {
          score -= 1;
        }
      }

      // Record answer logs
      gradedAnswers.push({
        questionId: q._id,
        selectedOptionIndex: selectedOption, // option letter ('A'/'B'/'C'/'D' or null)
        correctOptionIndex: q.correctOption,
        isCorrect,
        explanation: q.explanation
      });

      // Track stats for weakness calculator
      if (req.user) {
        const key = `${q.subject}::${q.topic}`;
        if (!topicStats[key]) {
          topicStats[key] = { correct: 0, total: 0, subject: q.subject, topic: q.topic };
        }
        topicStats[key].total++;
        if (isCorrect) {
          topicStats[key].correct++;
        }
      }
    });

    let attemptId = null;
    if (req.user) {
      // Save final Attempt schema
      const attempt = await Attempt.create({
        studentId: req.user.id,
        examId: exam._id,
        answers: answers || {},
        score,
        flaggedQuestions: flaggedQuestions || [],
        isCompleted: true,
        completedAt: Date.now()
      });
      attemptId = attempt._id;

      // Update User weakness profiles using dynamic calculations (only for students)
      if (req.user.role === 'student') {
        const user = await User.findById(req.user.id);
        if (user) {
          Object.keys(topicStats).forEach((key) => {
            const stats = topicStats[key];
            const successRate = Math.round((stats.correct / stats.total) * 100);

            // Find existing weak topic index
            const idx = user.weakTopics.findIndex(
              (t) => t.topic === stats.topic && t.subject === stats.subject
            );

            if (successRate < 70) {
              // Add or update weak topics
              if (idx !== -1) {
                user.weakTopics[idx].successRate = successRate;
              } else {
                user.weakTopics.push({
                  topic: stats.topic,
                  subject: stats.subject,
                  successRate
                });
              }
            } else if (idx !== -1) {
              // Student improved! Remove from weakness list
              user.weakTopics.splice(idx, 1);
            }
          });
          await user.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      score,
      totalQuestions: exam.questions.length,
      gradedAnswers,
      attemptId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { title, subject, durationMinutes, isDemo, isMonthly, windowOpen, windowClose, negativeMarking, questionsData, questions, randomCount } = req.body;

    const questionIds = [];

    // 1. Link existing question IDs
    if (questions && Array.isArray(questions)) {
      questions.forEach(id => {
        if (id) questionIds.push(id);
      });
    }

    // 2. Create and link inline question data
    if (questionsData && Array.isArray(questionsData)) {
      for (const qData of questionsData) {
        const newQ = await Question.create({
          questionText: qData.questionText,
          options: qData.options,
          correctOption: qData.correctOption || 'A',
          explanation: qData.explanation || '',
          subject: qData.subject || subject || 'Full Syllabus',
          topic: qData.topic || 'General'
        });
        questionIds.push(newQ._id);
      }
    }

    // 3. Automated random question bank pull
    if (randomCount && Number(randomCount) > 0) {
      const matchQuery = {};
      if (subject && subject !== 'Full Syllabus') {
        matchQuery.subject = subject;
      }
      
      const randomQuestions = await Question.aggregate([
        { $match: matchQuery },
        { $sample: { size: Number(randomCount) } }
      ]);
      
      randomQuestions.forEach(q => {
        questionIds.push(q._id);
      });
    }

    const exam = await Exam.create({
      title,
      subject: subject || 'Full Syllabus',
      questions: questionIds,
      durationMinutes: durationMinutes || 150,
      isDemo: isDemo || false,
      isMonthly: isMonthly || false,
      windowOpen: windowOpen || new Date(),
      windowClose: windowClose || new Date(Date.now() + 24 * 60 * 60 * 1000), // default 24h window
      negativeMarking: negativeMarking || false
    });

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'EXAM_CREATE',
      targetModel: 'Exam',
      targetId: exam._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({ success: true, exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all exams list
// @route   GET /api/v1/exams
// @access  Private
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({}).select('-questions').sort('-createdAt');
    res.status(200).json({ success: true, exams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student past exam attempts
// @route   GET /api/v1/exams/my-attempts
// @access  Private (Student)
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.user.id })
      .populate('examId', 'title subject durationMinutes')
      .sort('-completedAt');

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload test document (.docx) and extract/insert questions
// @route   POST /api/v1/exams/upload-test-doc
// @access  Private (Teacher / Admin)
exports.uploadTestDoc = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No document file uploaded." });
    }

    // Convert Word Buffer to Raw Text using Mammoth
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const rawText = result.value;

    // Split the document by the "===" delimiter
    const rawQuestions = rawText.split('===');
    const parsedQuestions = [];

    // RegEx patterns to capture each component
    const questionRegex = /Q\d+:\s*([\s\S]+?)(?=\s*[A-D]\))/i;
    const optionARegex = /A\)\s*([\s\S]+?)(?=\s*B\))/i;
    const optionBRegex = /B\)\s*([\s\S]+?)(?=\s*C\))/i;
    const optionCRegex = /C\)\s*([\s\S]+?)(?=\s*D\))/i;
    const optionDRegex = /D\)\s*([\s\S]+?)(?=\s*Answer:)/i;
    const answerRegex = /Answer:\s*([A-D])/i;
    const explanationRegex = /Explanation:\s*([\s\S]+)$/i;

    const fileSubject = req.body.subject || 'Biology';
    const fileTopic = req.body.topic || 'General';

    for (let rawChunk of rawQuestions) {
      const trimmedChunk = rawChunk.trim();
      if (!trimmedChunk) continue;

      const qTextMatch = trimmedChunk.match(questionRegex);
      const optAMatch = trimmedChunk.match(optionARegex);
      const optBMatch = trimmedChunk.match(optionBRegex);
      const optCMatch = trimmedChunk.match(optionCRegex);
      const optDMatch = trimmedChunk.match(optionDRegex);
      const ansMatch = trimmedChunk.match(answerRegex);
      const expMatch = trimmedChunk.match(explanationRegex);

      if (qTextMatch && optAMatch && optBMatch && optCMatch && optDMatch && ansMatch) {
        parsedQuestions.push({
          questionText: qTextMatch[1].trim(),
          options: [
            optAMatch[1].trim(),
            optBMatch[1].trim(),
            optCMatch[1].trim(),
            optDMatch[1].trim()
          ],
          correctOption: ansMatch[1].trim().toUpperCase(),
          explanation: expMatch ? expMatch[1].trim() : "No detailed explanation provided.",
          subject: fileSubject,
          topic: fileTopic
        });
      }
    }

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'Could not parse any valid questions. Please verify document formatting matches template.' });
    }

    // Insert questions to database
    const insertedQuestions = await Question.insertMany(parsedQuestions);
    const questionIds = insertedQuestions.map(q => q._id);

    // If an examId is specified in request body, append questions directly
    if (req.body.examId) {
      await Exam.findByIdAndUpdate(req.body.examId, {
        $push: { questions: { $each: questionIds } }
      });
    }

    res.status(200).json({
      success: true,
      message: `${insertedQuestions.length} questions successfully parsed and added.`,
      totalParsed: insertedQuestions.length,
      questions: insertedQuestions
    });
  } catch (error) {
    console.error("Doc Parser Error: ", error);
    res.status(500).json({ success: false, message: "Failed to parse document." });
  }
};

// @desc    Get all questions in database bank with optional search
// @route   GET /api/v1/exams/questions
// @access  Private (Teacher / Admin)
exports.getQuestions = async (req, res) => {
  try {
    const { subject, q } = req.query;
    let query = {};
    if (subject) query.subject = subject;
    if (q) query.questionText = { $regex: q, $options: 'i' };

    const questions = await Question.find(query).sort('-createdAt').limit(200);
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete mock exam
// @route   DELETE /api/v1/exams/:id
// @access  Private (Teacher / Admin)
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'EXAM_DELETE',
      targetModel: 'Exam',
      targetId: req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(200).json({ success: true, message: 'Exam removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete MCQ question from bank
// @route   DELETE /api/v1/exams/questions/:id
// @access  Private (Teacher / Admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Also pull question from any exam referencing it
    await Exam.updateMany(
      { questions: req.params.id },
      { $pull: { questions: req.params.id } }
    );

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'QUESTION_DELETE',
      targetModel: 'Question',
      targetId: req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(200).json({ success: true, message: 'Question removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update Exam mock settings
// @route   PUT /api/v1/exams/:id
// @access  Private (Teacher / Admin)
exports.updateExam = async (req, res) => {
  try {
    const { title, subject, durationMinutes, isDemo, isMonthly, windowOpen, windowClose, negativeMarking } = req.body;
    let exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.title = title !== undefined ? title : exam.title;
    exam.subject = subject !== undefined ? subject : exam.subject;
    exam.durationMinutes = durationMinutes !== undefined ? durationMinutes : exam.durationMinutes;
    exam.isDemo = isDemo !== undefined ? isDemo : exam.isDemo;
    exam.isMonthly = isMonthly !== undefined ? isMonthly : exam.isMonthly;
    exam.windowOpen = windowOpen !== undefined ? windowOpen : exam.windowOpen;
    exam.windowClose = windowClose !== undefined ? windowClose : exam.windowClose;
    exam.negativeMarking = negativeMarking !== undefined ? negativeMarking : exam.negativeMarking;

    await exam.save();

    // Audit log
    await AuditLog.create({
      operatorId: req.user.id,
      action: 'EXAM_UPDATE',
      targetModel: 'Exam',
      targetId: exam._id,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });

    res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


