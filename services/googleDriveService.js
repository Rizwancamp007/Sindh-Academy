const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const keyFilePath = path.join(__dirname, '../config/google-service-account.json');
let drive = null;

// Initialize conditionally to prevent crashes if JSON key file isn't uploaded yet
if (fs.existsSync(keyFilePath)) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    drive = google.drive({ version: 'v3', auth });
    console.log('Google Drive API client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Google Drive client:', error.message);
  }
} else {
  console.warn('Google Drive Service Account key file not found at:', keyFilePath);
  console.warn('Google Drive permissions automation will run in simulation/fallback mode.');
}

/**
 * Grant read-only access to a student's Gmail for the root folder
 * @param {string} studentEmail - The student's Google account email
 * @param {string} folderId - The ID of your root Google Drive folder
 */
exports.grantFolderAccess = async (studentEmail, folderId) => {
  if (!drive) {
    console.warn(`[SIMULATION Mode] Would have granted access to ${studentEmail} for folder ${folderId}`);
    return `simulated-perm-${Date.now()}`;
  }

  if (!folderId) {
    console.error('GOOGLE_DRIVE_ROOT_FOLDER_ID environment variable is missing.');
    return '';
  }

  try {
    const response = await drive.permissions.create({
      fileId: folderId,
      sendNotificationEmail: true, // Sends them an email notification from Google
      requestBody: {
        role: 'reader', // View only (no downloads/prints if set in Drive UI)
        type: 'user',
        emailAddress: studentEmail,
      },
    });
    console.log(`Access granted to ${studentEmail}. Permission ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('Failed to grant Google Drive permission:', error);
    throw error;
  }
};

/**
 * Revoke access from a student's Gmail (e.g., subscription expired)
 * @param {string} folderId - The ID of your root Google Drive folder
 * @param {string} permissionId - The Google permission ID stored when granted
 */
exports.revokeFolderAccess = async (folderId, permissionId) => {
  if (!drive) {
    console.warn(`[SIMULATION Mode] Would have deleted permission ${permissionId} for folder ${folderId}`);
    return;
  }

  if (!folderId || !permissionId || permissionId.startsWith('simulated-')) {
    console.warn('Missing details or simulated permission ID. Skipping revoke.');
    return;
  }

  try {
    await drive.permissions.delete({
      fileId: folderId,
      permissionId: permissionId,
    });
    console.log(`Access revoked for permission ID ${permissionId}.`);
  } catch (error) {
    console.error('Failed to revoke Google Drive permission:', error);
    throw error;
  }
};
