import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');

const baseTask: Task = {
	id: 1,
	title: 'Tâche existante',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([baseTask]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.tasks).toEqual([baseTask]);
		expect(result.current.error).toBeNull();
	});

	it('sets an error when loading fails', async () => {
		vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('boom');
		expect(result.current.tasks).toEqual([]);
	});

	it('adds a task and prepends it to the list', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([]);
		const newTask: Task = { ...baseTask, id: 2, title: 'Nouvelle tâche' };
		vi.mocked(taskApi.createTask).mockResolvedValue(newTask);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Nouvelle tâche' });
		});

		expect(result.current.tasks).toEqual([newTask]);
	});

	it('removes a task', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([baseTask]);
		vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(baseTask.id);
		});

		expect(result.current.tasks).toEqual([]);
	});

	it('toggles task completion', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([baseTask]);
		const toggled = { ...baseTask, completed: true };
		vi.mocked(taskApi.updateTask).mockResolvedValue(toggled);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(baseTask.id);
		});

		expect(taskApi.updateTask).toHaveBeenCalledWith(baseTask.id, { completed: true });
		expect(result.current.tasks).toEqual([toggled]);
	});
});
