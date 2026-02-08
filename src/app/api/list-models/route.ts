import { NextResponse } from 'next/server';
import { listAvailableModels } from '@/lib/logic/knowledge-service';

/**
 * API endpoint to list all available Gemini models
 * GET /api/list-models
 * 
 * This endpoint calls the listAvailableModels function which logs
 * detailed model information to the server console.
 */
export async function GET() {
    try {
        console.log("\n🔍 API /list-models called - fetching Gemini models...\n");
        
        const models = await listAvailableModels();
        
        // Return the models as JSON response
        return NextResponse.json({
            success: true,
            count: models.length,
            models: models.map(m => ({
                name: m.name,
                displayName: m.displayName,
                description: m.description,
                inputTokenLimit: m.inputTokenLimit,
                outputTokenLimit: m.outputTokenLimit,
                supportedActions: m.supportedActions,
            })),
        });
        
    } catch (error) {
        console.error("❌ Error in /api/list-models:", error);
        
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
