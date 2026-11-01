import { useEffect, useMemo, useState } from 'react';

type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Complaint {
  id: number;
  customer: string;
  subject: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolution: string;
  createdAt: string;
}

const STORAGE_KEY = 'edith_complaints';

const emptyForm = {
  customer: '',
  subject: '',
  description: '',
  category: 'General',
  priority: 'Medium' as ComplaintPriority,
  status: 'Open' as ComplaintStatus,
  resolution: '',
};

function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Complaint[]) : [];
    } catch (error) {
      console.error('Could not load complaints:', error);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return complaints.filter((complaint) => {
      const matchesSearch = [
        complaint.customer,
        complaint.subject,
        complaint.description,
        complaint.category,
      ].some((value) => value.toLowerCase().includes(search));

      const matchesStatus =
        statusFilter === 'All' || complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'All' || complaint.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  const openCount = complaints.filter(
    (item) => item.status === 'Open'
  ).length;

  const progressCount = complaints.filter(
    (item) => item.status === 'In Progress'
  ).length;

  const resolvedCount = complaints.filter(
    (item) => item.status === 'Resolved' || item.status === 'Closed'
  ).length;

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setSelectedComplaint(null);
  };

  const openEditForm = (complaint: Complaint) => {
    setEditingId(complaint.id);
    setForm({
      customer: complaint.customer,
      subject: complaint.subject,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      resolution: complaint.resolution,
    });
    setShowForm(true);
    setSelectedComplaint(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingId !== null) {
      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.id === editingId
            ? { ...complaint, ...form }
            : complaint
        )
      );
    } else {
      const newComplaint: Complaint = {
        id: Date.now(),
        ...form,
        createdAt: new Date().toISOString(),
      };

      setComplaints((previous) => [newComplaint, ...previous]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteComplaint = (id: number) => {
    if (!window.confirm('Delete this complaint permanently?')) return;

    setComplaints((previous) =>
      previous.filter((complaint) => complaint.id !== id)
    );
    setSelectedComplaint(null);
  };

  const updateStatus = (id: number, status: ComplaintStatus) => {
    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );

    setSelectedComplaint((previous) =>
      previous?.id === id ? { ...previous, status } : previous
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="edith-complaints">
      <section className="edith-complaint-stats">
        <div className="edith-complaint-stat">
          <span>TOTAL COMPLAINTS</span>
          <strong>{complaints.length.toString().padStart(2, '0')}</strong>
          <small>All recorded concerns</small>
        </div>

        <div className="edith-complaint-stat">
          <span>OPEN</span>
          <strong>{openCount.toString().padStart(2, '0')}</strong>
          <small>Awaiting attention</small>
        </div>

        <div className="edith-complaint-stat">
          <span>IN PROGRESS</span>
          <strong>{progressCount.toString().padStart(2, '0')}</strong>
          <small>Being investigated</small>
        </div>

        <div className="edith-complaint-stat">
          <span>RESOLVED / CLOSED</span>
          <strong>{resolvedCount.toString().padStart(2, '0')}</strong>
          <small>Completed cases</small>
        </div>
      </section>

      <section className="edith-panel edith-complaint-panel">
        <div className="edith-complaint-toolbar">
          <div>
            <p className="edith-eyebrow">CUSTOMER EXPERIENCE</p>
            <h2>Complaint register</h2>
            <span>Record, investigate and resolve customer concerns.</span>
          </div>

          <button className="edith-primary-btn" onClick={openAddForm}>
            ＋ New complaint
          </button>
        </div>

        <div className="edith-complaint-filters">
          <div className="edith-complaint-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search customer, subject or complaint..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <label>
            STATUS
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </label>

          <label>
            PRIORITY
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

          <button className="edith-clear-filters" onClick={clearFilters}>
            ↺ Clear
          </button>
        </div>

        {showForm && (
          <form className="edith-complaint-form" onSubmit={handleSubmit}>
            <div className="edith-complaint-form-heading">
              <div>
                <p className="edith-eyebrow">
                  {editingId !== null ? 'UPDATE CASE' : 'NEW CASE'}
                </p>
                <h3>
                  {editingId !== null
                    ? 'Edit complaint'
                    : 'Register a complaint'}
                </h3>
              </div>

              <button
                type="button"
                className="edith-complaint-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="edith-complaint-fields">
              <label>
                CUSTOMER NAME *
                <input
                  required
                  value={form.customer}
                  placeholder="Customer name"
                  onChange={(event) =>
                    setForm({ ...form, customer: event.target.value })
                  }
                />
              </label>

              <label>
                COMPLAINT SUBJECT *
                <input
                  required
                  value={form.subject}
                  placeholder="Briefly describe the issue"
                  onChange={(event) =>
                    setForm({ ...form, subject: event.target.value })
                  }
                />
              </label>

              <label>
                CATEGORY
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  <option>General</option>
                  <option>Billing</option>
                  <option>Product</option>
                  <option>Service</option>
                  <option>Delivery</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                PRIORITY
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      priority: event.target.value as ComplaintPriority,
                    })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>

              <label>
                STATUS
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as ComplaintStatus,
                    })
                  }
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </label>

              <label className="edith-complaint-wide">
                DESCRIPTION *
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  placeholder="Describe the customer's concern..."
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <label className="edith-complaint-wide">
                RESOLUTION NOTES
                <textarea
                  rows={3}
                  value={form.resolution}
                  placeholder="Record the investigation or resolution..."
                  onChange={(event) =>
                    setForm({ ...form, resolution: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="edith-complaint-form-actions">
              <button
                type="button"
                className="edith-secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="edith-primary-btn">
                {editingId !== null ? 'Save changes' : 'Create complaint'}
              </button>
            </div>
          </form>
        )}

        <div className="edith-complaint-list">
          {filteredComplaints.map((complaint) => (
            <article className="edith-complaint-row" key={complaint.id}>
              <button
                className="edith-complaint-summary"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="edith-complaint-id">
                  #{String(complaint.id).slice(-6)}
                </div>

                <div className="edith-complaint-main">
                  <strong>{complaint.subject}</strong>
                  <span>
                    {complaint.customer} · {complaint.category}
                  </span>
                  <small>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <span
                  className={`edith-complaint-priority ${complaint.priority.toLowerCase()}`}
                >
                  {complaint.priority}
                </span>

                <span
                  className={`edith-complaint-status ${complaint.status
                    .toLowerCase()
                    .replace(' ', '-')}`}
                >
                  {complaint.status}
                </span>

                <span className="edith-complaint-arrow">›</span>
              </button>
            </article>
          ))}

          {filteredComplaints.length === 0 && (
            <div className="edith-complaint-empty">
              <span>✧</span>
              <h3>
                {complaints.length === 0
                  ? 'No complaints recorded'
                  : 'No matching complaints'}
              </h3>
              <p>
                {complaints.length === 0
                  ? 'Create your first complaint to start tracking cases.'
                  : 'Try changing your search or filters.'}
              </p>
              {complaints.length === 0 && (
                <button className="edith-primary-btn" onClick={openAddForm}>
                  ＋ New complaint
                </button>
              )}
            </div>
          )}
        </div>

        <div className="edith-complaint-footer">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      </section>

      {selectedComplaint && (
        <div
          className="edith-complaint-overlay"
          onClick={() => setSelectedComplaint(null)}
        >
          <section
            className="edith-complaint-detail"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="edith-complaint-detail-heading">
              <div>
                <p className="edith-eyebrow">
                  CASE #{String(selectedComplaint.id).slice(-6)}
                </p>
                <h2>{selectedComplaint.subject}</h2>
                <span>
                  Submitted by {selectedComplaint.customer}
                </span>
              </div>

              <button
                className="edith-complaint-close"
                onClick={() => setSelectedComplaint(null)}
              >
                ×
              </button>
            </div>

            <div className="edith-complaint-detail-meta">
              <span>{selectedComplaint.category}</span>
              <span>{selectedComplaint.priority} priority</span>
              <span>
                {new Date(selectedComplaint.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="edith-complaint-detail-section">
              <span>COMPLAINT DESCRIPTION</span>
              <p>{selectedComplaint.description}</p>
            </div>

            <div className="edith-complaint-detail-section">
              <span>RESOLUTION NOTES</span>
              <p>
                {selectedComplaint.resolution || 'No resolution notes added yet.'}
              </p>
            </div>

            <label className="edith-complaint-detail-status">
              UPDATE STATUS
              <select
                value={selectedComplaint.status}
                onChange={(event) =>
                  updateStatus(
                    selectedComplaint.id,
                    event.target.value as ComplaintStatus
                  )
                }
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </label>

            <div className="edith-complaint-detail-actions">
              <button
                className="edith-secondary-btn"
                onClick={() => openEditForm(selectedComplaint)}
              >
                Edit complaint
              </button>

              <button
                className="edith-complaint-delete"
                onClick={() => deleteComplaint(selectedComplaint.id)}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Complaints;