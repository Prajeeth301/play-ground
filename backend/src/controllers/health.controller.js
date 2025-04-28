import os from 'os';
import prisma from '../prisma/prisma.client.js';


export const health = async (req, res) => {
    try {
        // Get system information
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            cpuCores: os.cpus().length,
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            uptime: os.uptime(), // System uptime in seconds
            timestamp: new Date().toISOString()
        };

        // Check DB connection (Prisma in this case)
        await prisma.$queryRaw`SELECT 1`; // Simple raw query to check the DB connection
        const dbStatus = 'Healthy';

        // Render health page with system and DB info
        res.render('health', {
            message: 'API is healthy',
            status: 'OK',
            systemInfo: systemInfo,
            dbStatus: dbStatus
        });
    } catch (error) {
        console.error(error);
        res.render('health', {
            message: 'API is unhealthy',
            status: 'ERROR',
            systemInfo: {},
            dbStatus: 'Unhealthy',
            error: error.message
        });
    }
};