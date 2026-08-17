import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllTeamTasks from '@salesforce/apex/TeamTasks_CRUD.getAllTeamTasks';
import handleCreateTask from '@salesforce/apex/TeamTasks_CRUD.handleCreateTask';
import handleUpdateTasks from '@salesforce/apex/TeamTasks_CRUD.handleUpdateTasks';

const COLUMNS = [
    { label: 'Task Name', fieldName: 'Name', type: 'text', wrapText: true, editable: true },
    { label: 'Project', fieldName: 'Team_Projects__c', type: 'text' },
    {
        label: 'Priority',
        fieldName: 'Tasks_Priority__c',
        type: 'text',
        cellAttributes: {
            class: { fieldName: 'priorityClass' }
        }
    },
    { label: 'Due Date', fieldName: 'Tasks_Due_Date__c', type: 'date-local', editable: true },
    { label: 'Assigned To', fieldName: 'Tasks_Assigned_To__c', type: 'text' },
    { label: 'Status', fieldName: 'Tasks_Status__c', type: 'text' },
    {
        label: 'Estimated Hours',
        fieldName: 'Tasks_Hours_Estimated__c',
        type: 'number',
        typeAttributes: { minimumFractionDigits: 1 },
        cellAttributes: { alignment: 'left' },
        editable: true
    }
];

const PRIORITY_CLASS_MAP = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low'
};

export default class TeamTasks extends LightningElement {
    valuePriority = '';
    draftValues = [];
    columns = COLUMNS;
    teamTasksList = [];
    @track selectedTask = [];
    teamTasksWiredResult;

    @wire(getAllTeamTasks) wiredTeamTasks(result) {
        this.teamTasksWiredResult = result;

        const { data, error } = result;
        if (data) {
            this.teamTasksList = data.map((record) => ({
                Id: record.Id,
                Name: record.Name,
                Team_Projects__c: record.Team_Projects__r ? record.Team_Projects__r.Name : '',
                Tasks_Priority__c: record.Tasks_Priority__c ? record.Tasks_Priority__c : '',
                priorityClass: PRIORITY_CLASS_MAP[record.Tasks_Priority__c] || '',
                Tasks_Due_Date__c: record.Tasks_Due_Date__c ? record.Tasks_Due_Date__c : null,
                Tasks_Assigned_To__c: record.Tasks_Assigned_To__r ? record.Tasks_Assigned_To__r.Name : '',
                Tasks_Status__c: record.Tasks_Status__c ? record.Tasks_Status__c : '',
                Tasks_Hours_Estimated__c: record.Tasks_Hours_Estimated__c ? record.Tasks_Hours_Estimated__c : null,
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

    handleCreateTask() {
        const taskName = this.template.querySelector('.taskName-input').value;
        const taskProject = this.template.querySelector('.taskProject-input').value;
        const taskPriority = this.valuePriority;
        const taskAssignedTo = this.template.querySelector('.taskAssignedTo-input').value;
        const taskDueDate = this.template.querySelector('.taskDueDate-input').value;
        const taskEstimatedHours = this.template.querySelector('.taskEstimatedHours-input').value;

        // Perform validation and create the task using the collected values
        handleCreateTask({ taskName, taskProject, taskPriority, taskAssignedTo, taskDueDate, taskEstimatedHours })
        .then(() => {
            this.handleResetValues();
            // Handle success, e.g., show a success message or refresh the task list
            return refreshApex(this.teamTasksWiredResult);
        })
        .catch((error) => {
            // Handle error, e.g., show an error message
            console.error('Error creating task:', error);
        });
    }

    handleUpdateTask(event) {
        const updatedFields = event.detail.draftValues;

            handleUpdateTasks({ tasks: updatedFields })
            .then(() => {
                this.draftValues = []; // clear the pending-edits bar
                refreshApex(this.teamTasksWiredResult); // re-pull fresh data from the server

            })
            .catch((error) => {
                console.error('Error updating task:', error);
            })

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
}