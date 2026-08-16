import { LightningElement, wire, track } from 'lwc';
import getAllTeamTasks from '@salesforce/apex/TeamTasks_CRUD.getAllTeamTasks';
import handleCreateTask from '@salesforce/apex/TeamTasks_CRUD.handleCreateTask';

const COLUMNS = [
    { label: 'Task Name', fieldName: 'taskName', type: 'text', wrapText: true },
    { label: 'Project', fieldName: 'project', type: 'text' },
    {
        label: 'Priority',
        fieldName: 'priority',
        type: 'text',
        cellAttributes: {
            class: { fieldName: 'priorityClass' }
        }
    },
    { label: 'Due Date', fieldName: 'dueDate', type: 'date-local' },
    { label: 'Assigned To', fieldName: 'assignedTo', type: 'text' },
    { label: 'Status', fieldName: 'status', type: 'text' },
    {
        label: 'Estimated Hours',
        fieldName: 'estimatedHours',
        type: 'number',
        typeAttributes: { minimumFractionDigits: 1 },
        cellAttributes: { alignment: 'left' }
    }
];

const PRIORITY_CLASS_MAP = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low'
};

export default class TeamTasks extends LightningElement {
    valuePriority = '';
    columns = COLUMNS;
    @track teamTasksList = [];
    @track selectedTask = [];

    @wire(getAllTeamTasks) teamTasks({ data, error }) {

        if (data) {
            console.log('Fetched team tasks:', data);
            this.teamTasksList = data.map((record) => ({
                id: record.Id,
                taskName: record.Name,
                project: record.Team_Projects__r ? record.Team_Projects__r.Name : '',
                priority: record.Tasks_Priority__c ? record.Tasks_Priority__c : '',
                priorityClass: PRIORITY_CLASS_MAP[record.Tasks_Priority__c] || '',
                dueDate: record.Tasks_Due_Date__c ? new Date(record.Tasks_Due_Date__c) : null,
                assignedTo: record.Tasks_Assigned_To__r ? record.Tasks_Assigned_To__r.Name : '',
                status: record.Tasks_Status__c ? record.Tasks_Status__c : '',
                estimatedHours: record.Tasks_Estimated_Hours__c ? record.Tasks_Estimated_Hours__c : null,
            }));
        } else if (error) {
            this.teamTasksList = [];
            console.error('Error fetching team tasks:', error);
        }
    }

    handleTasksSelection(event) {
        this.selectedTask = event.detail.selectedTask;
    }

    get optionsPriority() {
        return [
            { label: 'Choose Priority...', value: '' },
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
        ];
    }

    handleChangePriority(event) {
        this.valuePriority = event.detail.value;
    }

    handleProjectChange(event) {
        this.projectId = event.detail.recordId;
    }

    handleResetValues() {
        this.template.querySelector('.taskName-input').value = '';
        this.projectId = null;
        this.valuePriority = '';
        this.template.querySelector('.taskAssignedTo-input').value = null;
        this.template.querySelector('.taskDueDate-input').value = '';
        this.template.querySelector('.taskEstimatedHours-input').value = '';
    }

    handleCreateTask() {
        const taskName = this.template.querySelector('.taskName-input').value;
        const taskProject = this.template.querySelector('.taskProject-input').value;
        const taskPriority = this.valuePriority;
        const taskAssignedTo = this.template.querySelector('.taskAssignedTo-input').value;
        const taskDueDate = this.template.querySelector('.taskDueDate-input').value;
        const taskEstimatedHours = this.template.querySelector('.taskEstimatedHours-input').value;

        // Perform validation and create the task using the collected values
        this.handleResetValues();
        handleCreateTask({ taskName, taskProject, taskPriority, taskAssignedTo, taskDueDate, taskEstimatedHours })
            .then(() => {
                // Handle success, e.g., show a success message or refresh the task list
                console.log
            })
            .catch((error) => {
                // Handle error, e.g., show an error message
                console.error('Error creating task:', error);
            });
    }
}