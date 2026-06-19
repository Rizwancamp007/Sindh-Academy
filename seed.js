const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const Lecture = require('./models/Lecture');
const Review = require('./models/Review');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sea_ghotki');
    console.log('Connected to database. Seeding data...');

    // Clear existing collections
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Question.deleteMany({});
    await Lecture.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing users, exams, questions, lectures, and reviews.');

    const users = [
      {
        name: 'Seeded Student',
        email: 'student@sea.com',
        password: 'student123',
        role: 'student',
        isPaid: false,
        isVerified: true,
        dailyStreak: 3
      },
      {
        name: 'Premium Student',
        email: 'paid@sea.com',
        password: 'student123',
        role: 'student',
        isPaid: true,
        isVerified: true,
        dailyStreak: 5
      },
      {
        name: 'Academy Clerk',
        email: 'clerk@sea.com',
        password: 'clerk123',
        role: 'clerk',
        isVerified: true
      },
      {
        name: 'Academy Teacher',
        email: 'teacher@sea.com',
        password: 'teacher123',
        role: 'teacher',
        isVerified: true
      },
      {
        name: 'Academy Admin',
        email: 'admin@sea.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`Successfully created ${createdUsers.length} seed user accounts.`);

    // 2. Create sample lectures
    const lectures = [
      {
        title: 'Nucleus Full Concept - Biology',
        description: 'Detailed explanation of the cell nucleus, chromosomes, nuclear membrane, and nucleolus structure.',
        googleDriveFileId: 'ooYue89FtlM',
        isDemo: true,
        subject: 'Biology',
        topic: 'Nucleus'
      },
      {
        title: 'Bone & Cartilage MCQ Walkthrough',
        description: 'Step-by-step solutions to typical entrance questions on skeleton, cartilage types, and bone tissue.',
        googleDriveFileId: 'F7fGpFuy_xQ',
        isDemo: false,
        subject: 'Biology',
        topic: 'Skeletal System'
      },
      {
        title: 'Immune System & Immunity Types',
        description: 'Concept breakdown of active vs passive immunity, humoral vs cell-mediated responses.',
        googleDriveFileId: 'lsiLmTXd0Lk',
        isDemo: false,
        subject: 'Biology',
        topic: 'Immune System'
      },
      {
        title: 'Isotopes - Chemistry Concepts',
        description: 'Detailed lesson on isotopes, mass numbers, relative abundances, and isotopic calculations.',
        googleDriveFileId: 'SQkpXs045ck',
        isDemo: true,
        subject: 'Chemistry',
        topic: 'Atomic Structure'
      },
      {
        title: 'The Mole Concept',
        description: 'Comprehensive chemistry session covering Avogadro number, molar mass, and stoichiometric conversions.',
        googleDriveFileId: '_xdaiDnXhqA',
        isDemo: false,
        subject: 'Chemistry',
        topic: 'Stoichiometry'
      },
      {
        title: 'Practice Assessment Chemistry Part 1 (PDF)',
        description: 'Comprehensive entry test chemistry preparation sheet covering multiple topics.',
        googleDriveFileId: 'https://drive.google.com/file/d/1D9c4dIT-ZtCCTo2R1rgTusXjNI6CFY7b/view?usp=drive_link',
        isDemo: true,
        subject: 'Chemistry',
        topic: 'Assessment'
      },
      {
        title: 'Practice Assessment Physics Part 1 (PDF)',
        description: 'Physics multiple choice practice worksheet matching standard entry tests patterns.',
        googleDriveFileId: 'https://drive.google.com/file/d/1GYg_g-xjgZKSvyWlasmyJNUuTi9PZgqo/view?usp=drive_link',
        isDemo: false,
        subject: 'Physics',
        topic: 'Assessment'
      },
      {
        title: 'Comprehensive Entrance Practice (PDF)',
        description: 'Full syllabus test worksheet for MDCAT and ECAT preparations.',
        googleDriveFileId: 'https://drive.google.com/file/d/1fYNrmTLLKS1DfAh1yBQbrbbis3Ebi75D/view?usp=drive_link',
        isDemo: false,
        subject: 'General',
        topic: 'Assessment'
      },
      {
        title: 'Advanced Biology Mock Test (PDF)',
        description: 'Topic-wise detailed practice booklet on cellular biochemistry, genetics, and ecology.',
        googleDriveFileId: 'https://drive.google.com/file/d/1ZuCmq5SBnZrZGkZCaJpfgGa_GHLxxc3H/view?usp=drive_link',
        isDemo: false,
        subject: 'Biology',
        topic: 'Assessment'
      },
      {
        title: 'English and Logical Reasoning Mock (PDF)',
        description: 'Practice guidelines on comprehension, vocabulary, and analytical reasoning matrices.',
        googleDriveFileId: 'https://drive.google.com/file/d/12oZGdzWDormi5-0kr7C_R5cw25dUUlhT/view?usp=drive_link',
        isDemo: false,
        subject: 'English',
        topic: 'Assessment'
      },
      {
        title: 'Biology - Genetics',
        description: 'Core concepts of genetics, mendelian inheritance, and molecular biology for medical entry preparation.',
        googleDriveFileId: 'https://drive.google.com/file/d/1-95f-f8twCFeuWoKG0wQ4DIvA-GX6PwM/view?usp=drive_link',
        isDemo: true,
        subject: 'Biology',
        topic: 'Genetics'
      },
      {
        title: 'Chemistry - s & p block elements',
        description: 'Detailed concepts on group trends, chemical behaviors, and atomic properties of s and p block elements.',
        googleDriveFileId: 'https://drive.google.com/file/d/1nCYTlIbruaCrHIvCnwtCsIms9YCOaB9C/view?usp=drive_link',
        isDemo: true,
        subject: 'Chemistry',
        topic: 's & p block'
      },
      {
        title: 'Physics - 11th Physics All Chapters MCQs',
        description: 'Comprehensive walkthrough and explanation of important numericals and conceptual MCQs from all chapters of XI Physics.',
        googleDriveFileId: 'https://drive.google.com/file/d/14LclAGpycjm9yKJ8DU72dxbukroWw_NX/view?usp=drive_link',
        isDemo: true,
        subject: 'Physics',
        topic: '11th Physics'
      },
      {
        title: 'English - English Practice Material',
        description: 'Practice questions for grammar, sentence completion, and vocabulary drills required for MDCAT/ECAT tests.',
        googleDriveFileId: 'https://drive.google.com/file/d/1udCw6NL2PiSKK1c6JI5uPqZdWAGqXVbL/view?usp=drive_link',
        isDemo: true,
        subject: 'English',
        topic: 'English Practice'
      }
    ];

    const createdLectures = await Lecture.create(lectures);
    console.log(`Successfully created ${createdLectures.length} seed lectures.`);

    // 3. Create Sample Questions for Exams
    const questionsBank = [
      {
        questionText: 'Which organelle is responsible for ATP synthesis?',
        options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Lysosome'],
        correctOption: 'B',
        subject: 'Biology',
        topic: 'Cell Structure',
        explanation: 'Mitochondria are double-membraned organelles that carry out aerobic respiration, producing ATP.'
      },
      {
        questionText: 'The rate of change of linear momentum is equal to:',
        options: ['Velocity', 'Acceleration', 'Force', 'Kinetic Energy'],
        correctOption: 'C',
        subject: 'Physics',
        topic: 'Kinetics',
        explanation: 'According to Newtons second law, the rate of change of momentum is directly proportional to the applied force.'
      },
      {
        questionText: 'What is the oxidation state of Chromium in K2Cr2O7?',
        options: ['+3', '+4', '+5', '+6'],
        correctOption: 'D',
        subject: 'Chemistry',
        topic: 'Oxidation States',
        explanation: 'Solving: 2(+1) + 2(Cr) + 7(-2) = 0 => 2 + 2Cr - 14 = 0 => 2Cr = 12 => Cr = +6.'
      }
    ];

    const createdQuestions = await Question.create(questionsBank);
    console.log(`Successfully created ${createdQuestions.length} seed questions.`);

    // 4. Create Mock Exams
    const exams = [
      {
        title: 'MDCAT Biology Free Diagnostic Mock',
        subject: 'Biology',
        durationMinutes: 120,
        isDemo: true,
        isMonthly: false,
        windowOpen: new Date(),
        windowClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        negativeMarking: false,
        questions: [createdQuestions[0]._id]
      },
      {
        title: 'ECAT Monthly Engineering Assessment (Mechanics)',
        subject: 'Physics',
        durationMinutes: 150,
        isDemo: false,
        isMonthly: true,
        windowOpen: new Date(),
        windowClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        negativeMarking: true,
        questions: [createdQuestions[1]._id, createdQuestions[2]._id]
      },
      {
        title: 'Official MDCAT Mock Test (Document)',
        subject: 'Biology',
        durationMinutes: 150,
        isDemo: true,
        isMonthly: false,
        windowOpen: new Date(),
        windowClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        negativeMarking: false,
        externalDocLink: 'https://docs.google.com/document/d/1xFAV6TL4c_XkKAe3odK2MO_HEHPN6BZm/edit?usp=drive_link&ouid=109986115061125492207&rtpof=true&sd=true',
        questions: [createdQuestions[0]._id]
      },
      {
        title: 'Official ECAT Mock Test (Document)',
        subject: 'Physics',
        durationMinutes: 150,
        isDemo: true,
        isMonthly: false,
        windowOpen: new Date(),
        windowClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        negativeMarking: true,
        externalDocLink: 'https://docs.google.com/document/d/1xFAV6TL4c_XkKAe3odK2MO_HEHPN6BZm/edit?usp=drive_link&ouid=109986115061125492207&rtpof=true&sd=true',
        questions: [createdQuestions[1]._id]
      }
    ];

    const createdExams = await Exam.create(exams);
    console.log(`Successfully created ${createdExams.length} mock exams linked to questions.`);

    // 5. Create Success reviews
    const reviews = [
      {
        studentName: 'Aisha Baloch',
        achievement: 'MDCAT Score: 191/200',
        reviewText: 'Sindh Educational Academy was key to my MDCAT preparation! The video lectures and mock tests gave me the edge I needed.',
        avatarName: 'student1'
      },
      {
        studentName: 'Zain Ahmed',
        achievement: 'ECAT Merit Rank #14',
        reviewText: 'The practice tests and physics walkthroughs helped me master complex equations easily. Highly recommended!',
        avatarName: 'student2'
      },
      {
        studentName: 'Hira Shah',
        achievement: 'Admitted: LUMHS Jamshoro',
        reviewText: 'The daily streaks and detailed biological concept breakdowns built my confidence immensely.',
        avatarName: 'student3'
      }
    ];

    const createdReviews = await Review.create(reviews);
    console.log(`Successfully created ${createdReviews.length} success reviews.`);

    console.log('Database seeded successfully! Press Ctrl+C to exit.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
