import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import axios from 'axios';
import { Card, Button, Form, Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Trash, EyeSlash } from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TaskCard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const TaskCard = ({ task, onDelete, onStatusChange, isExpanded, onExpand, onHide, user }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date(task.target_date));
  const [hasInteracted, setHasInteracted] = useState(false); // Track user interaction
  const cardRef = useRef(null);
  const datePickerWrapperRef = useRef(null);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks/interactions/${task.task_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const interactions = response.data;
        const hasInteracted = interactions.some(interaction => interaction.user_id === user.user_id);
        setHasInteracted(hasInteracted);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      }
    };

    fetchInteractions();
  }, [task.task_id, user.user_id]);

  useEffect(() => {
    if (isExpanded) {
      cardRef.current.style.maxHeight = `${cardRef.current.scrollHeight}px`;
    } else {
      cardRef.current.style.maxHeight = '200px';
    }
  }, [isExpanded]);

  const logInteraction = useCallback(async (interactionType, interactionDetail) => {
    try {
      await axios.post(`${API_BASE_URL}/api/tasks/interactions`, {
        taskId: task.task_id,
        interactionType,
        interactionDetail
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setHasInteracted(true); // Mark as interacted
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }, [task.task_id]);

  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/tasks/${task.task_id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      onStatusChange(task.task_id, newStatus);
      logInteraction('status_change', newStatus);
      setHasInteracted(true); // Mark as interacted
    } catch (error) {
      console.error('There was an error updating the task status!', error);
    }
  }, [task.task_id, onStatusChange, logInteraction]);

  const handleStatusDropdownChange = useCallback((event) => {
    const newStatus = event.target.value;
    handleStatusChange(newStatus);
  }, [handleStatusChange]);

  const handleTargetDateChange = useCallback(async (date) => {
    setTargetDate(date);
    try {
      await axios.put(`${API_BASE_URL}/api/tasks/${task.task_id}/target-date`, { target_date: date.toISOString().split('T')[0] }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      logInteraction('target_date_change', date.toISOString().split('T')[0]);
    } catch (error) {
      console.error('There was an error updating the task target date!', error);
    }
  }, [task.task_id, logInteraction]);

  const assignees = task.assignees ? task.assignees.split(',') : [];
  const subDepartments = task.sub_departments ? task.sub_departments.split(',') : [];

  const handleDelete = useCallback(() => {
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    onDelete(task.task_id);
    setShowModal(false);
    logInteraction('delete', 'Task deleted');
  }, [onDelete, task.task_id, logInteraction]);

  const handleHide = useCallback(() => {
    onHide(task.task_id);
    logInteraction('hide', 'Task hidden');
  }, [onHide, task.task_id, logInteraction]);

  const handleCardClick = useCallback((e) => {
    if (
      e.target.closest('.task-card-dropdown') ||
      e.target.closest('.task-card-status-dropdown') ||
      (datePickerWrapperRef.current && datePickerWrapperRef.current.contains(e.target))
    ) {
      return;
    }
    onExpand();
    logInteraction('expand', 'Task expanded');
  }, [onExpand, logInteraction]);

  const isAssignedToUser = user ? assignees.includes(user.name) : false;
  const isCreatedByUser = user ? task.created_by === user.user_id : false;

  return (
    <Card className={`mb-3 task-card ${isExpanded ? 'expanded' : ''}`} onClick={handleCardClick} ref={cardRef}>
      {!isExpanded && (
        <OverlayTrigger placement="top" overlay={<Tooltip>Hide Task</Tooltip>}>
          <Button variant="link" className="task-card-hide-button-top-right" onClick={handleHide}>
            <EyeSlash />
          </Button>
        </OverlayTrigger>
      )}
      {!hasInteracted && <div className="status-dot blue"></div>} {/* Show dot if not interacted */}
      <Card.Body>
        <Card.Text>
          <strong>Created At:</strong> {new Date(task.created_at).toLocaleString()}
        </Card.Text>
        <Card.Title className="task-card-title">{task.title || 'Untitled Task'}</Card.Title>
        <Card.Text className="task-card-description" dangerouslySetInnerHTML={{ __html: task.description }}></Card.Text>
        <Card.Text className="task-card-created-by">
          <strong>By:</strong> {task.created_by_name}
        </Card.Text>
        {isExpanded && (
          <>
            <Card.Text>
              <strong>To:</strong> {assignees.join(', ') || 'N/A'}
            </Card.Text>
            <Card.Text>
              <strong>Subdept:</strong> {subDepartments.join(', ') || 'N/A'}
            </Card.Text>
            <Card.Text>
              <strong>Status:</strong> {task.status}
            </Card.Text>
            <div>
              <strong>Target Date:</strong>
              <div ref={datePickerWrapperRef}>
                <DatePicker selected={targetDate} onChange={handleTargetDateChange} disabled={!isAssignedToUser} />
              </div>
            </div>
            <Dropdown onToggle={() => setShowMenu(!showMenu)} show={showMenu} className="task-card-dropdown">
              <Dropdown.Toggle variant="link" id="dropdown-basic" className="task-card-dropdown-toggle">
                ⋮
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {isCreatedByUser && (
                  <>
                    <Dropdown.Item onClick={handleDelete} className="task-card-delete-button">
                      <Trash /> Delete
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleHide} className="task-card-hide-button">
                      <OverlayTrigger placement="top" overlay={<Tooltip>Hide Task</Tooltip>}>
                        <EyeSlash />
                      </OverlayTrigger>
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
            {isAssignedToUser && (
              <Form.Control as="select" value={task.status} onChange={handleStatusDropdownChange} className="mt-2 task-card-status-dropdown">
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Control>
            )}
          </>
        )}
      </Card.Body>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task? If you delete the task, the assignees will be notified, and the task will be removed from all users.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default memo(TaskCard);