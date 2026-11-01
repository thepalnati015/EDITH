import { useEffect, useMemo, useState } from 'react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Active' | 'Inactive';
  notes: string;
}

const STORAGE_KEY = 'edith_customers';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'Active' as 'Active' | 'Inactive',
  notes: '',
};

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Customer[]) : [];
    } catch (error) {
      console.error('Could not load customers:', error);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
      ].some((value) => value.toLowerCase().includes(search))
    );
  }, [customers, searchTerm]);

  const activeCount = customers.filter(
    (customer) => customer.status === 'Active'
  ).length;

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      status: customer.status,
      notes: customer.notes,
    });
    setShowForm(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const customerData: Customer = {
      id: editingId ?? Date.now(),
      ...form,
    };

    if (editingId !== null) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingId ? customerData : customer
        )
      );
    } else {
      setCustomers((previous) => [customerData, ...previous]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteCustomer = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmed) return;

    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== id)
    );
  };

  return (
    <div className="edith-customers">
      <section className="edith-customer-stats">
        <div className="edith-customer-stat">
          <span>TOTAL CUSTOMERS</span>
          <strong>{customers.length.toString().padStart(2, '0')}</strong>
          <small>All customer records</small>
        </div>

        <div className="edith-customer-stat">
          <span>ACTIVE CUSTOMERS</span>
          <strong>{activeCount.toString().padStart(2, '0')}</strong>
          <small>Currently active</small>
        </div>

        <div className="edith-customer-stat">
          <span>INACTIVE CUSTOMERS</span>
          <strong>
            {(customers.length - activeCount).toString().padStart(2, '0')}
          </strong>
          <small>Currently inactive</small>
        </div>
      </section>

      <section className="edith-panel edith-customer-panel">
        <div className="edith-customer-toolbar">
          <div>
            <p className="edith-eyebrow">RELATIONSHIP MANAGEMENT</p>
            <h2>Your customers</h2>
            <span>
              Manage customer information and contact details.
            </span>
          </div>

          <button className="edith-primary-btn" onClick={openAddForm}>
            ＋ Add customer
          </button>
        </div>

        <div className="edith-customer-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search name, email, phone or company..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {showForm && (
          <form className="edith-customer-form" onSubmit={handleSubmit}>
            <div className="edith-customer-form-heading">
              <div>
                <p className="edith-eyebrow">
                  {editingId !== null ? 'UPDATE RECORD' : 'NEW RECORD'}
                </p>
                <h3>
                  {editingId !== null ? 'Edit customer' : 'Add a customer'}
                </h3>
              </div>

              <button
                type="button"
                className="edith-customer-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="edith-customer-fields">
              <label>
                CUSTOMER NAME *
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>

              <label>
                EMAIL ADDRESS *
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>

              <label>
                PHONE NUMBER
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </label>

              <label>
                COMPANY
                <input
                  type="text"
                  placeholder="Company name"
                  value={form.company}
                  onChange={(event) =>
                    setForm({ ...form, company: event.target.value })
                  }
                />
              </label>

              <label>
                CUSTOMER STATUS
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as 'Active' | 'Inactive',
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label className="edith-customer-notes">
                NOTES
                <textarea
                  rows={3}
                  placeholder="Add any useful information about this customer..."
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="edith-customer-form-actions">
              <button
                type="button"
                className="edith-secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="edith-primary-btn">
                {editingId !== null ? 'Save changes' : 'Add customer'}
              </button>
            </div>
          </form>
        )}

        <div className="edith-customer-table-wrap">
          <table className="edith-customer-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>COMPANY</th>
                <th>PHONE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="edith-customer-identity">
                      <div className="edith-customer-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{customer.name}</strong>
                        <span>{customer.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{customer.company || '—'}</td>
                  <td>{customer.phone || '—'}</td>

                  <td>
                    <span
                      className={`edith-customer-status ${
                        customer.status === 'Active' ? 'active' : 'inactive'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td>
                    <div className="edith-customer-actions">
                      <button
                        onClick={() => openEditForm(customer)}
                        title="Edit customer"
                      >
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => deleteCustomer(customer.id)}
                        title="Delete customer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="edith-customer-empty">
              <span>✧</span>
              <h3>
                {customers.length === 0
                  ? 'No customers yet'
                  : 'No matching customers'}
              </h3>
              <p>
                {customers.length === 0
                  ? 'Add your first customer to start building your records.'
                  : 'Try another search term.'}
              </p>

              {customers.length === 0 && (
                <button className="edith-primary-btn" onClick={openAddForm}>
                  ＋ Add your first customer
                </button>
              )}
            </div>
          )}
        </div>

        <div className="edith-customer-footer">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </section>
    </div>
  );
}

export default Customers;