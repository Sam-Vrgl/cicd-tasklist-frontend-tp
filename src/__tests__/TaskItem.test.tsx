import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Première tâche',
	description: 'Description 1',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('calls onToggle when the checkbox is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		await user.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('saves edited title and description', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);

		await user.click(screen.getByLabelText('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Titre modifié');
		await user.click(screen.getByText('Enregistrer'));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Description 1',
		});
	});

	it('cancels edit and restores original values', async () => {
		const user = userEvent.setup();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);

		await user.click(screen.getByLabelText('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Changement non sauvegardé');
		await user.click(screen.getByText('Annuler'));

		expect(screen.getByText('Première tâche')).toBeInTheDocument();
	});

	it('requires a second click on delete to confirm', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
		);

		const deleteButton = screen.getByLabelText('Supprimer');
		await user.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		await user.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
