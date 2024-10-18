import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Card, Button, Form, Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Trash, EyeSlash,} from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TaskCard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const TaskCard = ({ task, onDelete, onStatusChange, isExpanded, onExpand, onHide, user, canDragAndDrop }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date(task.target_date));
  const [hasInteracted, setHasInteracted] = useState(false); // Track user interaction
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const cardRef = useRef(null);
  const datePickerWrapperRef = useRef(null);

  useEffect(() => {
    const interactions = task.interactions || [];
    const hasInteracted = interactions.some(interaction => interaction.user_id === user.user_id);
    setHasInteracted(hasInteracted);
  }, [task.interactions, user.user_id]);

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
      e.target.closest('.task-card-description') ||
      (datePickerWrapperRef.current && datePickerWrapperRef.current.contains(e.target))
    ) {
      return;
    }
    onExpand();
    logInteraction('expand', 'Task expanded');
  }, [onExpand, logInteraction]);

  const handleDescriptionClick = (e) => {
    e.stopPropagation();
    e.target.style.cursor = 'text';
  };

  const handleDescriptionMouseEnter = (e) => {
    e.target.style.cursor = 'default';
  };

  const handleDescriptionDragStart = (e) => {
    e.preventDefault();
  };

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const isAssignedToUser = user ? assignees.includes(user.name) : false;
  const isCreatedByUser = user ? task.created_by === user.user_id : false;

  // Find the latest interaction
  const latestInteraction = (task.interactions || []).reduce((latest, interaction) => {
    return new Date(interaction.interaction_timestamp) > new Date(latest.interaction_timestamp) ? interaction : latest;
  }, (task.interactions || [])[0]);

  return (
    <>
      <Card className={`mb-3 task-card ${isExpanded ? 'expanded' : ''}`} onClick={handleCardClick} onDoubleClick={handleDoubleClick} ref={cardRef}>
        {!isExpanded && (
          <OverlayTrigger placement="top" overlay={<Tooltip>Hide Task</Tooltip>}>
            <Button variant="link" className="task-card-hide-button-top-right" onClick={handleHide}>
              <EyeSlash />
            </Button>
          </OverlayTrigger>
        )}
        {!hasInteracted && <div className="status-dot blue"></div>} {/* Show dot if not interacted */}
        <Card.Body className="task-card-body">
          <Card.Text className="task-card-created-at">
            <strong>At:</strong> {new Date(task.created_at).toLocaleString()}
          </Card.Text>
          <Card.Title className="task-card-title">{task.title || 'Untitled Task'}</Card.Title>
          <Card.Text
            className="task-card-description"
            dangerouslySetInnerHTML={{ __html: task.description }}
            onClick={handleDescriptionClick}
            onMouseEnter={handleDescriptionMouseEnter}
            onDragStart={handleDescriptionDragStart}
          ></Card.Text>
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
              <div>
                <strong>Latest Interaction:</strong>
                {latestInteraction ? (
                  <p>
                    {latestInteraction.interaction_type} at {new Date(latestInteraction.interaction_timestamp).toLocaleString()}
                  </p>
                ) : (
                  <p>No interactions</p>
                )}
              </div>
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

      <Modal show={isModalOpen} onHide={closeModal} className="task-details-modal">
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Title:</strong> {task.title || 'Untitled Task'}</p>
          <p><strong>Description:</strong> <span dangerouslySetInnerHTML={{ __html: task.description }}></span></p>
          <p><strong>Created At:</strong> {new Date(task.created_at).toLocaleString()}</p>
          <p><strong>Created By:</strong> {task.created_by_name}</p>
          <p><strong>Assignees:</strong> {assignees.join(', ') || 'N/A'}</p>
          <p><strong>Sub-Departments:</strong> {subDepartments.join(', ') || 'N/A'}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Target Date:</strong> {new Date(targetDate).toLocaleDateString()}</p>
          <p><strong>Latest Interaction:</strong> {latestInteraction ? `${latestInteraction.interaction_type} at ${new Date(latestInteraction.interaction_timestamp).toLocaleString()}` : 'No interactions'}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    task_id: PropTypes.number.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    created_by: PropTypes.number.isRequired,
    created_by_name: PropTypes.string,
    target_date: PropTypes.string,
    status: PropTypes.string,
    assignees: PropTypes.string,
    sub_departments: PropTypes.string,
    interactions: PropTypes.arrayOf(PropTypes.shape({
      interaction_id: PropTypes.number,
      user_id: PropTypes.number,
      interaction_type: PropTypes.string,
      interaction_timestamp: PropTypes.string
    }))
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  canDragAndDrop: PropTypes.bool.isRequired
};

export default memo(TaskCard);