/**
 * AcademicX - WhatsApp Reminder Cron Job
 * Runs bi-weekly to generate and send fee reminders
 */

const { processPendingReminders, generateScheduledReminders } = require('../whatsapp/reminder-service');

/**
 * Main cron job function
 * This should be scheduled to run every 15 minutes for processing pending messages
 * and daily for generating scheduled reminders
 */
async function runWhatsAppCron() {
    const now = new Date();
    const hour = now.getHours();
    
    console.log(`Running WhatsApp cron job at ${now.toISOString()}`);
    
    try {
        // Process pending reminders every 15 minutes
        await processPendingReminders();
        
        // Generate scheduled reminders daily at 9 AM
        if (hour === 9) {
            console.log('Generating scheduled fee reminders...');
            await generateScheduledReminders();
        }
        
        console.log('WhatsApp cron job completed successfully');
        return { success: true };
    } catch (error) {
        console.error('WhatsApp cron job failed:', error);
        return { success: false, error: error.message };
    }
}

// Export for use in different environments
module.exports = {
    runWhatsAppCron,
    
    // Individual functions for testing
    processPendingReminders,
    generateScheduledReminders
};

// Run directly if called as script
if (require.main === module) {
    runWhatsAppCron()
        .then(result => {
            console.log('Cron job result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Cron job error:', error);
            process.exit(1);
        });
}
