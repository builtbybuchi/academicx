import React, { useEffect, useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { DEFAULT_GRADING } from '../../../../shared/utils/index.js';
import { getGradingScheme, saveGradingScheme } from '../../../../shared/utils/api.js';

export default function Grading() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [schemeId, setSchemeId] = useState('');
    const [scheme, setScheme] = useState(DEFAULT_GRADING);
    const [scoreComponents, setScoreComponents] = useState([
        { id: 'cat', name: 'CAT', weight: 30 },
        { id: 'exam', name: 'Exam', weight: 70 }
    ]);
    const [saving, setSaving] = useState(false);

    // Edit modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [editForm, setEditForm] = useState({ min: '', max: '', grade: '', remark: '' });

    // Add modal state
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ min: '', max: '', grade: '', remark: '' });

    // Score component modal states
    const [componentModalOpen, setComponentModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [componentForm, setComponentForm] = useState({ name: '', weight: '' });
    const [deleteComponentModalOpen, setDeleteComponentModalOpen] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);

    useEffect(() => {
        if (!schoolId) return;

        let active = true;
        async function load() {
            const current = await getGradingScheme(schoolId);
            if (!active || !current) return;

            setSchemeId(current.$id);

            // Load score components from database or use defaults
            if (current.scoreComponents) {
                try {
                    const parsedComponents = JSON.parse(current.scoreComponents);
                    if (Array.isArray(parsedComponents) && parsedComponents.length > 0) {
                        setScoreComponents(parsedComponents);
                    }
                } catch {
                    // Fallback to defaults
                }
            }

            try {
                const parsed = current.ranges ? JSON.parse(current.ranges) : DEFAULT_GRADING;
                setScheme(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GRADING);
            } catch {
                setScheme(DEFAULT_GRADING);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [schoolId]);

    const handleSave = async () => {
        const totalWeight = scoreComponents.reduce((sum, c) => sum + Number(c.weight || 0), 0);
        if (totalWeight !== 100) {
            toast({ type: 'error', title: 'Invalid weights', message: `Score component weights must sum to 100%. Current total: ${totalWeight}%` });
            return;
        }

        try {
            setSaving(true);
            await saveGradingScheme(schoolId, {
                name: 'Default Scheme',
                ranges: JSON.stringify(scheme),
                scoreComponents: JSON.stringify(scoreComponents),
            }, schemeId || undefined);
            toast({ type: 'success', title: 'Grading saved', message: 'The grading scheme was saved to the database.' });
        } catch (error) {
            toast({ type: 'error', title: 'Save failed', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (index) => {
        setSelectedIndex(index);
        setEditForm({ ...scheme[index] });
        setEditModalOpen(true);
    };

    const handleDeleteClick = (index) => {
        setSelectedIndex(index);
        setDeleteModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (editForm.min === '' || editForm.max === '' || !editForm.grade) {
            toast({ type: 'error', title: 'Missing fields', message: 'Min score, max score, and grade are required.' });
            return;
        }

        const min = Number(editForm.min);
        const max = Number(editForm.max);

        if (min > max) {
            toast({ type: 'error', title: 'Invalid range', message: 'Min score cannot be greater than max score.' });
            return;
        }

        const newScheme = [...scheme];
        newScheme[selectedIndex] = {
            min: min,
            max: max,
            grade: editForm.grade.toUpperCase(),
            remark: editForm.remark
        };

        // Sort by min score
        newScheme.sort((a, b) => b.min - a.min);

        setScheme(newScheme);
        setEditModalOpen(false);
        setSelectedIndex(null);
        toast({ type: 'success', title: 'Grade updated', message: 'Grading entry updated successfully.' });
    };

    const handleConfirmDelete = () => {
        if (scheme.length <= 1) {
            toast({ type: 'error', title: 'Cannot delete', message: 'You must have at least one grading entry.' });
            setDeleteModalOpen(false);
            return;
        }

        const newScheme = scheme.filter((_, i) => i !== selectedIndex);
        setScheme(newScheme);
        setDeleteModalOpen(false);
        setSelectedIndex(null);
        toast({ type: 'success', title: 'Grade deleted', message: 'Grading entry deleted successfully.' });
    };

    const handleAddClick = () => {
        setAddForm({ min: '', max: '', grade: '', remark: '' });
        setAddModalOpen(true);
    };

    const handleSaveAdd = () => {
        if (addForm.min === '' || addForm.max === '' || !addForm.grade) {
            toast({ type: 'error', title: 'Missing fields', message: 'Min score, max score, and grade are required.' });
            return;
        }

        const min = Number(addForm.min);
        const max = Number(addForm.max);

        if (min > max) {
            toast({ type: 'error', title: 'Invalid range', message: 'Min score cannot be greater than max score.' });
            return;
        }

        // Check for overlapping ranges
        const overlap = scheme.some(s => (min >= s.min && min <= s.max) || (max >= s.min && max <= s.max));
        if (overlap) {
            toast({ type: 'warning', title: 'Overlapping range', message: 'This range overlaps with an existing grade. Please review.' });
        }

        const newScheme = [...scheme, {
            min: min,
            max: max,
            grade: addForm.grade.toUpperCase(),
            remark: addForm.remark
        }];

        // Sort by min score descending
        newScheme.sort((a, b) => b.min - a.min);

        setScheme(newScheme);
        setAddModalOpen(false);
        toast({ type: 'success', title: 'Grade added', message: 'New grading entry added successfully.' });
    };

    const resetToDefault = () => {
        setScheme([...DEFAULT_GRADING]);
        toast({ type: 'success', title: 'Reset complete', message: 'Grading scheme reset to default values.' });
    };

    // Score component management functions
    const handleAddComponent = () => {
        setEditingComponent(null);
        setComponentForm({ name: '', weight: '' });
        setComponentModalOpen(true);
    };

    const handleEditComponent = (component) => {
        setEditingComponent(component);
        setComponentForm({ name: component.name, weight: String(component.weight) });
        setComponentModalOpen(true);
    };

    const handleDeleteComponentClick = (component) => {
        setComponentToDelete(component);
        setDeleteComponentModalOpen(true);
    };

    const handleSaveComponent = () => {
        if (!componentForm.name || componentForm.weight === '') {
            toast({ type: 'error', title: 'Missing fields', message: 'Component name and weight are required.' });
            return;
        }

        const weight = Number(componentForm.weight);
        if (weight < 0 || weight > 100) {
            toast({ type: 'error', title: 'Invalid weight', message: 'Weight must be between 0 and 100.' });
            return;
        }

        if (editingComponent) {
            // Update existing component
            setScoreComponents(prev => prev.map(c =>
                c.id === editingComponent.id
                    ? { ...c, name: componentForm.name, weight }
                    : c
            ));
            toast({ type: 'success', title: 'Component updated', message: 'Score component updated successfully.' });
        } else {
            // Add new component
            const newComponent = {
                id: 'comp_' + Date.now(),
                name: componentForm.name,
                weight
            };
            setScoreComponents(prev => [...prev, newComponent]);
            toast({ type: 'success', title: 'Component added', message: 'New score component added successfully.' });
        }

        setComponentModalOpen(false);
        setEditingComponent(null);
    };

    const handleConfirmDeleteComponent = () => {
        if (!componentToDelete) return;

        if (scoreComponents.length <= 1) {
            toast({ type: 'error', title: 'Cannot delete', message: 'You must have at least one score component.' });
            setDeleteComponentModalOpen(false);
            return;
        }

        setScoreComponents(prev => prev.filter(c => c.id !== componentToDelete.id));
        setDeleteComponentModalOpen(false);
        setComponentToDelete(null);
        toast({ type: 'success', title: 'Component deleted', message: 'Score component deleted successfully.' });
    };

    const handleMoveComponent = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === scoreComponents.length - 1) return;

        const newComponents = [...scoreComponents];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
        setScoreComponents(newComponents);
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Grading Schemes</h1><p className="page-subtitle">Configure how grades are calculated</p></div>

            <LiquidGlassPanel hover={false} style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, margin: 0 }}>Default Grading Scheme</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-glass btn-sm" onClick={handleAddClick}>
                            ➕ Add Grade
                        </button>
                        <button className="btn btn-glass btn-sm" onClick={resetToDefault}>
                            ↩️ Reset to Default
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Min Score</th>
                                <th>Max Score</th>
                                <th>Grade</th>
                                <th>Remark</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheme.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.min}</td>
                                    <td>{r.max}</td>
                                    <td><span className="badge badge-primary">{r.grade}</span></td>
                                    <td>{r.remark}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-glass btn-sm"
                                                onClick={() => handleEditClick(i)}
                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteClick(i)}
                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {scheme.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-gray-500)' }}>
                        No grading entries. Click "Add Grade" to create one.
                    </div>
                )}
            </LiquidGlassPanel>

            <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, margin: 0 }}>Score Components</h3>
                    <button className="btn btn-glass btn-sm" onClick={handleAddComponent}>
                        ➕ Add Component
                    </button>
                </div>
                <div className="table-container" style={{ marginBottom: 16 }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Component Name</th>
                                <th>Weight (%)</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoreComponents.map((component, index) => (
                                <tr key={component.id}>
                                    <td style={{ width: 80 }}>
                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                            <button
                                                className="btn btn-glass btn-sm"
                                                onClick={() => handleMoveComponent(index, 'up')}
                                                disabled={index === 0}
                                                style={{ padding: '2px 6px', fontSize: 10 }}
                                            >
                                                ↑
                                            </button>
                                            <span style={{ fontSize: 12, minWidth: 20, textAlign: 'center' }}>
                                                {index + 1}
                                            </span>
                                            <button
                                                className="btn btn-glass btn-sm"
                                                onClick={() => handleMoveComponent(index, 'down')}
                                                disabled={index === scoreComponents.length - 1}
                                                style={{ padding: '2px 6px', fontSize: 10 }}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </td>
                                    <td>{component.name}</td>
                                    <td><span className="badge badge-primary">{component.weight}%</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-glass btn-sm"
                                                onClick={() => handleEditComponent(component)}
                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteComponentClick(component)}
                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {scoreComponents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-gray-500)' }}>
                        No score components. Click "Add Component" to create one.
                    </div>
                )}
                <div style={{
                    fontSize: 12,
                    color: scoreComponents.reduce((sum, c) => sum + Number(c.weight || 0), 0) === 100
                        ? 'rgba(255,255,255,0.5)'
                        : '#EF4444',
                    marginBottom: 12,
                    fontWeight: scoreComponents.reduce((sum, c) => sum + Number(c.weight || 0), 0) === 100 ? 'normal' : 'bold'
                }}>
                    Total Weight: {scoreComponents.reduce((sum, c) => sum + Number(c.weight || 0), 0)}%
                    {scoreComponents.reduce((sum, c) => sum + Number(c.weight || 0), 0) !== 100 && ' (must equal 100%)'}
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Scheme'}
                </button>
            </LiquidGlassPanel>

            {/* Edit Grade Modal */}
            <Modal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Grade Range"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn btn-glass btn-sm" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                            Save Changes
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="grid grid-2">
                        <FormField
                            label="Min Score"
                            type="number"
                            value={editForm.min}
                            onChange={(value) => setEditForm(prev => ({ ...prev, min: value }))}
                            required
                        />
                        <FormField
                            label="Max Score"
                            type="number"
                            value={editForm.max}
                            onChange={(value) => setEditForm(prev => ({ ...prev, max: value }))}
                            required
                        />
                    </div>
                    <FormField
                        label="Grade"
                        value={editForm.grade}
                        onChange={(value) => setEditForm(prev => ({ ...prev, grade: value }))}
                        placeholder="A, B, C..."
                        required
                    />
                    <FormField
                        label="Remark"
                        value={editForm.remark}
                        onChange={(value) => setEditForm(prev => ({ ...prev, remark: value }))}
                        placeholder="Excellent, Very Good..."
                    />
                </div>
            </Modal>

            {/* Add Grade Modal */}
            <Modal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title="Add Grade Range"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn btn-glass btn-sm" onClick={() => setAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveAdd}>
                            Add Grade
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="grid grid-2">
                        <FormField
                            label="Min Score"
                            type="number"
                            value={addForm.min}
                            onChange={(value) => setAddForm(prev => ({ ...prev, min: value }))}
                            placeholder="0-100"
                            required
                        />
                        <FormField
                            label="Max Score"
                            type="number"
                            value={addForm.max}
                            onChange={(value) => setAddForm(prev => ({ ...prev, max: value }))}
                            placeholder="0-100"
                            required
                        />
                    </div>
                    <FormField
                        label="Grade"
                        value={addForm.grade}
                        onChange={(value) => setAddForm(prev => ({ ...prev, grade: value }))}
                        placeholder="A, B, C..."
                        required
                    />
                    <FormField
                        label="Remark"
                        value={addForm.remark}
                        onChange={(value) => setAddForm(prev => ({ ...prev, remark: value }))}
                        placeholder="Excellent, Very Good..."
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Grade Range"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn btn-glass btn-sm" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={handleConfirmDelete}>
                            Delete
                        </button>
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>
                        Are you sure you want to delete this grade range?
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
                        <strong>{scheme[selectedIndex]?.grade}</strong>: {scheme[selectedIndex]?.min}-{scheme[selectedIndex]?.max} ({scheme[selectedIndex]?.remark})
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 16 }}>
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
            {/* Score Component Modal */}
            <Modal
                open={componentModalOpen}
                onClose={() => {
                    setComponentModalOpen(false);
                    setEditingComponent(null);
                }}
                title={editingComponent ? 'Edit Score Component' : 'Add Score Component'}
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-glass btn-sm"
                            onClick={() => {
                                setComponentModalOpen(false);
                                setEditingComponent(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveComponent}>
                            {editingComponent ? 'Save Changes' : 'Add Component'}
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormField
                        label="Component Name"
                        value={componentForm.name}
                        onChange={(value) => setComponentForm(prev => ({ ...prev, name: value }))}
                        placeholder="Assignment, Quiz, Project, Midterm, etc."
                        required
                    />
                    <FormField
                        label="Weight (%)"
                        type="number"
                        value={componentForm.weight}
                        onChange={(value) => setComponentForm(prev => ({ ...prev, weight: value }))}
                        placeholder="0-100"
                        required
                    />
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                        Examples: Assignment, Quiz, Project, Midterm, CAT, Exam, etc.
                    </div>
                </div>
            </Modal>

            {/* Delete Component Confirmation Modal */}
            <Modal
                open={deleteComponentModalOpen}
                onClose={() => setDeleteComponentModalOpen(false)}
                title="Delete Score Component"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn btn-glass btn-sm" onClick={() => setDeleteComponentModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={handleConfirmDeleteComponent}>
                            Delete
                        </button>
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>
                        Are you sure you want to delete this score component?
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
                        <strong>{componentToDelete?.name}</strong> ({componentToDelete?.weight}%)
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 16 }}>
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
