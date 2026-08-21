// TaskItem.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FiX } from 'react-icons/fi'

interface Task {
  id: string;
  title: string;
  isComplete: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task ${isDragging ? 'is-dragging' : ''}`}
      data-testid="task"
    >
      <button
        type="button"
        className="grip"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <span className="grip-dots">
          <i /><i />
          <i /><i />
          <i /><i />
        </span>
      </button>

      <button
        type="button"
        role="checkbox"
        aria-checked={task.isComplete}
        aria-label={task.isComplete ? 'Marcar como não concluída' : 'Marcar como concluída'}
        className={`dot ${task.isComplete ? 'is-checked' : ''}`}
        onClick={() => onToggle(task.id)}
      />
      <p className={task.isComplete ? 'is-complete' : ''}>{task.title}</p>
      <button
        type="button"
        className="remove"
        data-testid="remove-task-button"
        aria-label="Remover tarefa"
        onClick={() => onRemove(task.id)}
      >
        <FiX size={16} />
      </button>
    </li>
  );
}
