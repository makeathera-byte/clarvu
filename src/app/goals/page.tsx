'use client';

import { useEffect, useState } from 'react';
import { GoalsClient } from './GoalsClient';
import { getActiveGoals, getGoalHistory, type Goal } from './actions/goalsActions';

export default function GoalsPage() {
    const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
    const [historyGoals, setHistoryGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadGoals() {
            try {
                const [active, history] = await Promise.all([
                    getActiveGoals(),
                    getGoalHistory()
                ]);
                setActiveGoals(active);
                setHistoryGoals(history);
            } catch (error) {
                console.error('Error loading goals:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadGoals();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <GoalsClient
            initialGoals={activeGoals}
            initialHistory={historyGoals}
        />
    );
}
