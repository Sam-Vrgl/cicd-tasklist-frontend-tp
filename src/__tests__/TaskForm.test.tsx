import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('shows a validation error when submitting an empty title', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.click(screen.getByText('Ajouter'));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('calls onSubmit with trimmed values and clears the form', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), '  Nouvelle tâche  ');
		await user.type(screen.getByLabelText('Description'), '  Une description  ');
		await user.click(screen.getByText('Ajouter'));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Nouvelle tâche',
			description: 'Une description',
		});
		expect(screen.getByLabelText('Titre')).toHaveValue('');
		expect(screen.getByLabelText('Description')).toHaveValue('');
	});

	it('renders edit mode with initial values and calls onCancel', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(
			<TaskForm
				onSubmit={vi.fn()}
				onCancel={onCancel}
				mode="edit"
				initialValues={{ title: 'Titre existant', description: 'Desc existante' }}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByLabelText('Titre')).toHaveValue('Titre existant');
		expect(screen.getByText('Modifier')).toBeInTheDocument();

		await user.click(screen.getByText('Annuler'));
		expect(onCancel).toHaveBeenCalled();
	});
});
