import { GoalsClient } from './GoalsClient';
import { getActiveGoals, getGoalHistory } from './actions/goalsActions';

export default async function GoalsPage() {
    const [activeGoals, historyGoals] = await Promise.all([
        getActiveGoals(),
        getGoalHistory()
    ]);

    return (
        <GoalsClient
            initialGoals={activeGoals}
            initialHistory={historyGoals}
        />
    );
}
