/**
 *  edgeJobs.ts
 *
 *  Runs Supabase edge functions and tracks which ones are running.
 *  Running state is kept at module level so it survives leaving and returning to a page.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { SupabaseConfiguration } from "@digitalaidseattle/supabase";
import { useEffect, useState } from "react";

const runningJobs = new Set<string>();
const runningListeners = new Set<() => void>();

function setJobRunning(functionName: string, isRunning: boolean) {
    if (isRunning) {
        runningJobs.add(functionName);
    } else {
        runningJobs.delete(functionName);
    }
    runningListeners.forEach(listener => listener());
}

// Invokes an edge function and returns its reply; throws if the call fails
export async function runEdgeJob(functionName: string, body?: Record<string, unknown>): Promise<unknown> {
    setJobRunning(functionName, true);
    try {
        const { data, error } = await SupabaseConfiguration.getInstance()
            .getSupabaseClient().functions
            .invoke(functionName, body ? { body } : undefined);
        if (error) throw error;
        return data;
    }
    finally {
        setJobRunning(functionName, false);
    }
}

// Names of the edge functions currently running; re-renders when that changes
export function useRunningJobs(): string[] {
    const [running, setRunning] = useState<string[]>(() => [...runningJobs]);

    useEffect(() => {
        const update = () => setRunning([...runningJobs]);
        runningListeners.add(update);
        return () => {
            runningListeners.delete(update);
        };
    }, []);

    return running;
}
