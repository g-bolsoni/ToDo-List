// TaskList.tsx
import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'

import '../styles/tasklist.scss'

import { FiPlus } from 'react-icons/fi'
import { TaskItem } from './TaskItem'

interface Task {
  id: string;
  title: string;
  isComplete: boolean;
}

const STORAGE_KEY = '@todolist:tasks';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // distance mínima antes de iniciar o drag: evita que um clique simples no
  // checkbox ou no botão de remover seja interpretado como arraste
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const completedCount = tasks.filter(task => task.isComplete).length;
  const progress = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  function handleCreateNewTask() {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      isComplete: false,
    }

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleCreateNewTask();
    }
  }

  function handleToggleTaskCompletion(id: string) {
    setTasks(prev => prev.map(task => task.id === id ? {
      ...task,
      isComplete: !task.isComplete
    } : task));
  }

  function handleRemoveTask(id: string) {
    setTasks(prev => prev.filter(task => task.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTasks(prev => {
      const oldIndex = prev.findIndex(task => task.id === active.id);
      const newIndex = prev.findIndex(task => task.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <section className="task-list container">
      <div className="panel">
        <div className="panel-top">
          <span className="eyebrow">Tarefas</span>
          {tasks.length > 0 && (
            <span className="counter">{completedCount}/{tasks.length}</span>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            placeholder="Adicionar uma tarefa"
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            value={newTaskTitle}
          />
          <button
            type="submit"
            data-testid="add-task-button"
            onClick={handleCreateNewTask}
            aria-label="Adicionar tarefa"
          >
            <FiPlus size={18} />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-dot" />
            <p>Nenhuma tarefa por aqui.</p>
            <span>Adicione a primeira acima.</span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <ul className="tasks">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTaskCompletion}
                    onRemove={handleRemoveTask}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  )
}
