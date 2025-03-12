import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const styles = {
    modalContent: {
        backgroundColor: '#2d2d2d',
        color: '#fff',
        borderRadius: '8px',
        padding: '20px',
    },
    modalHeader: {
        borderBottom: 'none',
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    modalBody: {
        color: '#b3b3b3',
    },
    formControl: {
        backgroundColor: '#3a3a3a',
        color: '#ffffff',
        border: '1px solid #555',
        borderRadius: '4px',
        marginBottom: '10px',
    },
    modalFooter: {
        borderTop: 'none',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    buttonSecondary: {
        backgroundColor: '#6c757d',
        border: 'none',
        marginRight: '10px',
    },
    buttonPrimary: {
        backgroundColor: '#007bff',
        border: 'none',
    },
};

function AddPersonModal({ open, onClose, onSave }) {
    const [personData, setPersonData] = useState({
        name: '',
        email: '',
        role: 'CLIENT',
        personPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPersonData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const savePerson = () => {
        onSave(personData);
        setPersonData({ name: '', email: '', role: 'CLIENT', personPassword: '' });
    };

    return (
        <Modal show={open} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton style={styles.modalHeader}>
                <Modal.Title style={styles.modalTitle}>Add New Person</Modal.Title>
            </Modal.Header>
            <Modal.Body style={styles.modalBody}>
                <Form>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter name"
                            name="name"
                            value={personData.name}
                            onChange={handleChange}
                            style={styles.formControl}
                            autoFocus
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            name="email"
                            value={personData.email}
                            onChange={handleChange}
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formRole">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                            as="select"
                            name="role"
                            value={personData.role}
                            onChange={handleChange}
                            style={styles.formControl}
                        >
                            <option value="CLIENT">CLIENT</option>
                            <option value="ADMIN">ADMIN</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            name="personPassword"
                            value={personData.personPassword}
                            onChange={handleChange}
                            style={styles.formControl}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer style={styles.modalFooter}>
                <Button
                    variant="secondary"
                    onClick={onClose}
                    style={styles.buttonSecondary}
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={savePerson}
                    style={styles.buttonPrimary}
                >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddPersonModal;
