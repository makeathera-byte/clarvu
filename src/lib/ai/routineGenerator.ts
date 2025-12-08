import Groq from 'groq-sdk';

interface Task {
    id: string;
    title: string;
    start_time: string | null;
    end_time: string | null;
    status: string;
    category_id: string | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
    type: string;
}

interface CalendarEvent {
    title: string;
    start_time: string;
    end_time: string;
}

interface RoutineItem {
    time: string;
    activity: string;
    duration: string;
    category?: string;
}

interface RoutineResult {
    morning: RoutineItem[];
    afternoon: RoutineItem[];
    evening: RoutineItem[];
    notes: string;
}

export async function runRoutineAI(
    tasks: Task[] | null,
    categories: Category[] | null,
    events: CalendarEvent[] | null
): Promise<RoutineResult> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error('GROQ_API_KEY not configured');
        return getDefaultRoutine();
    }

    const client = new Groq({ apiKey });

    // Extract patterns: deep work hours, distractions, common tasks
    const deepWorkCats = ['growth', 'delivery'];
    const distractionCats = ['waste'];

    const deepWorkTimes: Record<number, number> = {};
    const distractionTimes: Record<number, number> = {};
    const taskCounts: Record<string, number> = {};

    for (const t of tasks || []) {
        if (!t.start_time || !t.end_time) continue;

        const start = new Date(t.start_time);
        const hour = start.getHours();

        const cat = (categories || []).find(c => c.id === t.category_id);

        const duration = (new Date(t.end_time).getTime() - new Date(t.start_time).getTime()) / 60000;

        if (cat && deepWorkCats.includes(cat.type)) {
            deepWorkTimes[hour] = (deepWorkTimes[hour] || 0) + duration;
        }

        if (cat && distractionCats.includes(cat.type)) {
            distractionTimes[hour] = (distractionTimes[hour] || 0) + duration;
        }

        // Track common tasks
        const titleLower = t.title.toLowerCase();
        taskCounts[titleLower] = (taskCounts[titleLower] || 0) + 1;
    }

    // Find best and worst hours
    const bestHourEntry = Object.entries(deepWorkTimes).sort((a, b) => b[1] - a[1])[0];
    const worstHourEntry = Object.entries(distractionTimes).sort((a, b) => b[1] - a[1])[0];
    const bestHour = bestHourEntry ? bestHourEntry[0] : null;
    const worstHour = worstHourEntry ? worstHourEntry[0] : null;

    // Find most common tasks
    const commonTasks = Object.entries(taskCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([title]) => title);

    // Summarize data for prompt
    const taskSummary = (tasks || []).slice(0, 20).map(t => ({
        title: t.title,
        time: t.start_time ? new Date(t.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        category: (categories || []).find(c => c.id === t.category_id)?.name || 'Uncategorized',
    }));

    const eventsSummary = (events || []).map(e => ({
        title: e.title,
        time: new Date(e.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }));

    const prompt = `You are DayFlow AI, a productivity coach. Build a personalized daily routine based on this user data:

RECENT TASKS (last 14 days sample):
${JSON.stringify(taskSummary, null, 2)}

CATEGORIES:
${(categories || []).map(c => `- ${c.name} (${c.type})`).join('\n')}

TODAY'S CALENDAR EVENTS:
${eventsSummary.length > 0 ? JSON.stringify(eventsSummary, null, 2) : 'No events'}

PATTERNS DETECTED:
- Most productive hour for deep work: ${bestHour ? `${bestHour}:00` : 'Not enough data'}
- Hour with most distractions: ${worstHour ? `${worstHour}:00` : 'Not enough data'}
- Most common tasks: ${commonTasks.join(', ') || 'Not enough data'}

Create a balanced daily routine with 3-4 activities per time block. Each activity should have a specific time, activity name, and duration. Include breaks and account for calendar events.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "morning": [
    {"time": "6:00 AM", "activity": "Morning routine", "duration": "30 min", "category": "personal"},
    {"time": "6:30 AM", "activity": "Exercise", "duration": "45 min", "category": "personal"}
  ],
  "afternoon": [
    {"time": "12:00 PM", "activity": "Lunch break", "duration": "1 hour", "category": "necessity"}
  ],
  "evening": [
    {"time": "6:00 PM", "activity": "Dinner", "duration": "1 hour", "category": "necessity"}
  ],
  "notes": "Brief personalized insights based on their patterns"
}`;

    try {
        const completion = await client.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                {
                    role: 'system',
                    content: 'You are a productivity coach. Respond ONLY with valid JSON. No markdown formatting, no code blocks, just pure JSON.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000,
        });

        const content = completion.choices[0]?.message?.content || '';

        // Clean the response - remove any markdown formatting
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
        }

        const routine = JSON.parse(cleanContent) as RoutineResult;

        // Validate structure
        if (!routine.morning || !routine.afternoon || !routine.evening) {
            return getDefaultRoutine();
        }

        return routine;
    } catch (error) {
        console.error('Error generating routine:', error);
        return getDefaultRoutine();
    }
}

function getDefaultRoutine(): RoutineResult {
    return {
        morning: [
            { time: '6:00 AM', activity: 'Wake up & morning routine', duration: '30 min', category: 'personal' },
            { time: '6:30 AM', activity: 'Exercise or stretch', duration: '30 min', category: 'personal' },
            { time: '7:00 AM', activity: 'Breakfast', duration: '30 min', category: 'necessity' },
            { time: '8:00 AM', activity: 'Deep work block', duration: '2 hours', category: 'growth' },
        ],
        afternoon: [
            { time: '12:00 PM', activity: 'Lunch break', duration: '1 hour', category: 'necessity' },
            { time: '1:00 PM', activity: 'Admin tasks & emails', duration: '1 hour', category: 'admin' },
            { time: '2:00 PM', activity: 'Project work', duration: '2 hours', category: 'delivery' },
            { time: '4:00 PM', activity: 'Short break', duration: '15 min', category: 'personal' },
        ],
        evening: [
            { time: '6:00 PM', activity: 'End work day', duration: '30 min', category: 'admin' },
            { time: '6:30 PM', activity: 'Dinner', duration: '1 hour', category: 'necessity' },
            { time: '8:00 PM', activity: 'Personal time', duration: '2 hours', category: 'personal' },
            { time: '10:00 PM', activity: 'Wind down & sleep prep', duration: '30 min', category: 'personal' },
        ],
        notes: 'This is a default routine. Complete more tasks to get AI-personalized recommendations based on your work patterns.',
    };
}
