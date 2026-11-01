
import { useEffect, useState } from 'react';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import AIAssistant from './components/AIAssistant';
import Customers from './components/Customers';
import Complaints from './components/Complaints';
import MyProfile from './components/MyProfile';
import Settings from './components/Settings';


interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  category: string;
  completed: boolean;
}

type Page =
  | 'Dashboard'
  | 'My Tasks'
  | 'Customers'
  | 'Complaints'
  | 'AI Assistant'
  | 'Settings'
  | 'My Profile';

type TaskStatus = 'All' | 'Pending' | 'Completed';

const navigation: { id: Page; label: string; icon: string }[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: '◫' },
  { id: 'My Tasks', label: 'My Tasks', icon: '☷' },
  { id: 'Customers', label: 'Customers', icon: '♧' },
  { id: 'Complaints', label: 'Complaints', icon: '▤' },
  { id: 'AI Assistant', label: 'AI Assistant', icon: '✧' },
];

function App() {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Task filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('taskpilot_tasks');

      if (savedTasks) {
        return JSON.parse(savedTasks) as Task[];
      }
    } catch (error) {
      console.error('Could not load saved tasks:', error);
    }

    return [
      {
        id: 1,
        title: 'Respond to customer complaint',
        description: 'Follow up with the customer.',
        priority: 'High',
        category: 'Customer Support',
        completed: false,
      },
      {
        id: 2,
        title: 'Review pending customer orders',
        description: 'Check orders awaiting processing.',
        priority: 'Medium',
        category: 'Operations',
        completed: false,
      },
      {
        id: 3,
        title: 'Prepare monthly sales report',
        description: 'Prepare the monthly report.',
        priority: 'Low',
        category: 'Reporting',
        completed: false,
      },
    ];
  });

  const [customerStats, setCustomerStats] = useState({
  total: 0,
  active: 0,
});

const [complaintStats, setComplaintStats] = useState({
  total: 0,
  open: 0,
  critical: 0,
});

  useEffect(() => {
    localStorage.setItem('taskpilot_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
  if (activePage !== 'Dashboard') return;

  try {
    const savedCustomers = JSON.parse(
      localStorage.getItem('edith_customers') || '[]'
    );

    const savedComplaints = JSON.parse(
      localStorage.getItem('edith_complaints') || '[]'
    );

    setCustomerStats({
      total: savedCustomers.length,
      active: savedCustomers.filter(
        (customer: { status: string }) => customer.status === 'Active'
      ).length,
    });

    setComplaintStats({
      total: savedComplaints.length,
      open: savedComplaints.filter(
        (complaint: { status: string }) =>
          complaint.status === 'Open' ||
          complaint.status === 'In Progress'
      ).length,
      critical: savedComplaints.filter(
        (complaint: { priority: string; status: string }) =>
          complaint.priority === 'Critical' &&
          complaint.status !== 'Resolved' &&
          complaint.status !== 'Closed'
      ).length,
    });
  } catch (error) {
    console.error('Could not load dashboard data:', error);
  }
}, [activePage]);

  const createTask = (newTask: {
    title: string;
    description: string;
    priority: string;
    category: string;
  }) => {
    const task: Task = {
      id: Date.now(),
      ...newTask,
      completed: false,
    };

    setTasks((previous) => [task, ...previous]);
    setShowCreateModal(false);
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
    setSelectedTask(null);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );

    setSelectedTask(updatedTask);
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  const highPriorityCount = tasks.filter(
    (task) =>
      !task.completed &&
      (task.priority === 'High' || task.priority === 'Critical')
  ).length;

  // Categories are automatically collected from existing tasks.
  const categories = Array.from(
    new Set(tasks.map((task) => task.category).filter(Boolean))
  ).sort();

  // Apply search, filters and sorting.
  const filteredTasks = tasks
    .filter((task) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && !task.completed) ||
        (statusFilter === 'Completed' && task.completed);

      const matchesPriority =
        priorityFilter === 'All' || task.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === 'All' || task.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return a.id - b.id;
      }

      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = {
          Critical: 0,
          High: 1,
          Medium: 2,
          Low: 3,
        };

        return (
          (priorityOrder[a.priority] ?? 4) -
          (priorityOrder[b.priority] ?? 4)
        );
      }

      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }

      return b.id - a.id;
    });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setSortBy('newest');
  };

  const filtersActive =
    searchTerm !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All';

  const renderTaskRows = (taskList: Task[]) => {
    if (taskList.length === 0) {
      return (
        <div className="edith-empty">
          <span>✧</span>
          <h3>Nothing here yet</h3>
          <p>Create a task or adjust your filters.</p>
        </div>
      );
    }

    return taskList.map((task) => (
      <div
        className="edith-task-row"
        key={task.id}
        onClick={() => setSelectedTask(task)}
      >
        <div className="edith-task-main">
          <span
            className={`edith-task-check ${
              task.completed ? 'is-complete' : ''
            }`}
          >
            {task.completed ? '✓' : ''}
          </span>

          <div className="edith-task-info">
            <h3 className={task.completed ? 'task-is-complete' : ''}>
              {task.title}
            </h3>
            <p>{task.category}</p>
          </div>
        </div>

        <span className={`edith-priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>

        <button
          className="edith-complete-btn"
          onClick={(event) => {
            event.stopPropagation();
            toggleTaskCompletion(task.id);
          }}
        >
          {task.completed ? 'Undo' : 'Complete'}
        </button>
      </div>
    ));
  };

  const pageDescription: Record<Page, string> = {
    Dashboard: 'An overview of your business at a glance.',
    'My Tasks': 'Organise, manage and track your work.',
    Customers: 'Your customer relationships, all in one place.',
    Complaints: 'Keep track of customer concerns and resolutions.',
    'AI Assistant': 'Your intelligent operations companion.',
    Settings: 'Manage your workspace preferences.',
    'My Profile': 'Your personal workspace information.',
  };

  return (
    <div className="edith-shell">
      <aside className="edith-sidebar">
        
<button
  type="button"
  className="edith-brand"
  onClick={() => {
    setActivePage('Dashboard');
    setProfileOpen(false);
    setNotificationsOpen(false);
  }}
>
  <div className="edith-brand-mark">E</div>
  <div>
    <h2>EDITH<span>.</span></h2>
    <p>INTELLIGENCE, REFINED.</p>
  </div>
</button>


        <div className="edith-workspace">
          <span className="edith-workspace-icon">◈</span>
          <div>
            <span>YOUR WORKSPACE</span>
            <strong>Business Operations</strong>
          </div>
          <span className="edith-chevron">⌄</span>
        </div>

        <div className="edith-nav-label">MAIN MENU</div>

        <nav className="edith-navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`edith-nav-item ${
                activePage === item.id ? 'active' : ''
              }`}
              onClick={() => {
                setActivePage(item.id);
                setProfileOpen(false);
              }}
            >
              <span className="edith-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'AI Assistant' && (
                <span className="edith-nav-sparkle">✦</span>
              )}
            </button>
          ))}
        </nav>

        <div className="edith-sidebar-bottom">
          <div className="edith-nav-label">PREFERENCES</div>

          <button
            className={`edith-nav-item ${
              activePage === 'Settings' ? 'active' : ''
            }`}
            onClick={() => setActivePage('Settings')}
          >
            <span className="edith-nav-icon">⚙</span>
            <span>Settings</span>
          </button>

          <div className="edith-sidebar-divider" />

          <button
            className="edith-user-card"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            <div className="edith-avatar">P</div>
            <div className="edith-user-info">
              <strong>Pranavi</strong>
              <span>Founder</span>
            </div>
            <span className="edith-user-menu">•••</span>
          </button>
        </div>
      </aside>

      <main className="edith-main">
        <header className="edith-header">
          <div>
            <p className="edith-breadcrumb">
              WORKSPACE <span>/</span> {activePage.toUpperCase()}
            </p>
            <h1>{activePage}</h1>
          </div>

          <div className="edith-header-actions">
            <button
              className={`edith-header-icon ${
                notificationsOpen ? 'selected' : ''
              }`}
              aria-label="Notifications"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
            >
              ♧
              <span className="edith-notification-dot" />
            </button>

            <div className="edith-header-divider" />

            <button
              className="edith-header-profile"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
            >
              <div className="edith-avatar">P</div>
              <span>Pranavi</span>
              <span className="edith-chevron">⌄</span>
            </button>
          </div>

          {profileOpen && (
            <div className="edith-dropdown">
              <div className="edith-dropdown-heading">
                <div className="edith-avatar">P</div>
                <div>
                  <strong>Pranavi</strong>
                  <span>Administrator</span>
                </div>
              </div>

              <div className="edith-dropdown-divider" />

              <button onClick={() => {
                setActivePage('My Profile');
                setProfileOpen(false);
              }}>
                <span>♙</span> My Profile
              </button>

              <button onClick={() => {
                setActivePage('Settings');
                setProfileOpen(false);
              }}>
                <span>⚙</span> Account Settings
              </button>

              <button onClick={() => {
                setNotificationsOpen(true);
                setProfileOpen(false);
              }}>
                <span>♧</span> Notifications
              </button>
            </div>
          )}

          {notificationsOpen && (
            <div className="edith-dropdown edith-notification-dropdown">
              <div className="edith-dropdown-title">
                <strong>Notifications</strong>
                <span>Recent updates</span>
              </div>
              <div className="edith-notification-empty">
                <span>✧</span>
                <strong>You're all caught up</strong>
                <p>There are no new notifications.</p>
              </div>
              <button
                className="edith-dropdown-close"
                onClick={() => setNotificationsOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </header>

        <div className="edith-page-content">
          {activePage === 'Dashboard' && (
            <>
              <section className="edith-welcome">
                <div>
                  <p className="edith-eyebrow">
                    YOUR BUSINESS. YOUR CONTROL.
                  </p>
                  <h2>Good afternoon, Pranavi<span>.</span></h2>
                  <p>Everything you need to keep your operations moving.</p>
                </div>

                <button
                  className="edith-primary-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <span>＋</span> Create new task
                </button>
              </section>

              <section className="edith-stats">
                <div className="edith-stat-card">
                  <div className="edith-stat-top">
                    <span>Total tasks</span>
                    <span className="edith-stat-icon">▤</span>
                  </div>
                  <h3>{tasks.length.toString().padStart(2, '0')}</h3>
                  <p>Across all workflows</p>
                </div>

                <div className="edith-stat-card">
                  <div className="edith-stat-top">
                    <span>Pending tasks</span>
                    <span className="edith-stat-icon">◷</span>
                  </div>
                  <h3>{pendingCount.toString().padStart(2, '0')}</h3>
                  <p>Waiting for action</p>
                </div>

                <div className="edith-stat-card">
                  <div className="edith-stat-top">
                    <span>Completed</span>
                    <span className="edith-stat-icon">✓</span>
                  </div>
                  <h3>{completedCount.toString().padStart(2, '0')}</h3>
                  <p>Successfully finished</p>
                </div>

                <div className="edith-stat-card">
                  <div className="edith-stat-top">
                    <span>High priority</span>
                    <span className="edith-stat-icon">⚑</span>
                  </div>
                  <h3>{highPriorityCount.toString().padStart(2, '0')}</h3>
                  <p>Need your attention</p>
                </div>
              </section>

              <section className="edith-stats edith-business-stats">
  <div className="edith-stat-card">
    <div className="edith-stat-top">
      <span>Total customers</span>
      <span className="edith-stat-icon">♧</span>
    </div>
    <h3>{customerStats.total.toString().padStart(2, '0')}</h3>
    <p>{customerStats.active} active customers</p>
  </div>

  <div className="edith-stat-card">
    <div className="edith-stat-top">
      <span>Total complaints</span>
      <span className="edith-stat-icon">▤</span>
    </div>
    <h3>{complaintStats.total.toString().padStart(2, '0')}</h3>
    <p>Recorded customer concerns</p>
  </div>

  <div className="edith-stat-card">
    <div className="edith-stat-top">
      <span>Open complaints</span>
      <span className="edith-stat-icon">◷</span>
    </div>
    <h3>{complaintStats.open.toString().padStart(2, '0')}</h3>
    <p>Awaiting resolution</p>
  </div>

  <div className="edith-stat-card">
    <div className="edith-stat-top">
      <span>Critical complaints</span>
      <span className="edith-stat-icon">⚑</span>
    </div>
    <h3>{complaintStats.critical.toString().padStart(2, '0')}</h3>
    <p>Require urgent attention</p>
  </div>
</section>

              <section className="edith-dashboard-grid">
                <div className="edith-panel">
                  <div className="edith-panel-heading">
                    <div>
                      <p className="edith-eyebrow">YOUR WORKFLOW</p>
                      <h2>Recent tasks</h2>
                      <span>Stay on top of your daily operations.</span>
                    </div>
                    <button
                      className="edith-text-btn"
                      onClick={() => setActivePage('My Tasks')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="edith-task-list">
                    {renderTaskRows(tasks.slice(0, 5))}
                  </div>
                </div>

                <div className="edith-ai-panel">
                  <div className="edith-ai-heading">
                    <div className="edith-ai-symbol">✧</div>
                    <div>
                      <p className="edith-eyebrow">
                        YOUR INTELLIGENT COMPANION
                      </p>
                      <h2>Meet your AI assistant</h2>
                      <span>Built to simplify your operations.</span>
                    </div>
                  </div>
                  <AIAssistant />
                </div>
              </section>
            </>
          )}

          {activePage === 'My Tasks'   && (
            <section className="edith-panel edith-full-panel">
              <div className="edith-panel-heading">
                <div>
                  <p className="edith-eyebrow">WORK MANAGEMENT</p>
                  <h2>All tasks</h2>
                  <span>
                    Showing {filteredTasks.length} of {tasks.length} tasks ·{' '}
                    {pendingCount} pending · {completedCount} completed
                  </span>
                </div>

                <button
                  className="edith-primary-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  ＋ Create task
                </button>
              </div>

              <div className="edith-task-filters">
                <div className="edith-search-box">
                  <span>⌕</span>
                  <input
                    type="search"
                    placeholder="Search tasks by title or description..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="edith-filter-grid">
                  <label>
                    <span>STATUS</span>
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as TaskStatus)
                      }
                    >
                      <option value="All">All statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>

                  <label>
                    <span>PRIORITY</span>
                    <select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value)}
                    >
                      <option value="All">All priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </label>

                  <label>
                    <span>CATEGORY</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                    >
                      <option value="All">All categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>SORT BY</span>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="priority">Highest priority</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </label>
                </div>

                <div className="edith-filter-bottom">
                  <span>
                    {filtersActive
                      ? 'Filters are active'
                      : 'Showing all tasks'}
                  </span>

                  <button
                    className="edith-clear-filters"
                    onClick={clearFilters}
                  >
                    ↺ Clear filters
                  </button>
                </div>
              </div>

              <div className="edith-task-list">
                {renderTaskRows(filteredTasks)}
              </div>
            </section>
          )}

          {activePage === 'AI Assistant' && (
            <section className="edith-panel edith-full-panel">
              <div className="edith-panel-heading">
                <div>
                  <p className="edith-eyebrow">INTELLIGENCE CENTRE</p>
                  <h2>AI Assistant</h2>
                  <span>
                    Analyse customer concerns and draft professional replies.
                  </span>
                </div>
              </div>
              <AIAssistant />
            </section>
          )}

          {activePage === 'Customers' && <Customers />}


{activePage === 'Customers' && <Customers />}

{activePage === 'Complaints' && <Complaints />}

{activePage === 'My Profile' && <MyProfile />}

{activePage === 'Settings' && <Settings />}
        </div>

        <footer className="edith-footer">
          <span>EDITH<span className="edith-footer-dot">.</span></span>
          <span>YOUR BUSINESS, THOUGHTFULLY MANAGED.</span>
        </footer>

      </main>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createTask}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={
            tasks.find((task) => task.id === selectedTask.id) ?? selectedTask
          }
          onClose={() => setSelectedTask(null)}
          onToggleComplete={toggleTaskCompletion}
          onDelete={deleteTask}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}

export default App;
