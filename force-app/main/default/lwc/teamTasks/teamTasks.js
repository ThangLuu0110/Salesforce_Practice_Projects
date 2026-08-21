import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllTeamTasks from '@salesforce/apex/TeamTasks_CRUD.getAllTeamTasks';
import handleCreateTask from '@salesforce/apex/TeamTasks_CRUD.handleCreateTask';
import handleUpdateTasks from '@salesforce/apex/TeamTasks_CRUD.handleUpdateTasks';
import handleInProgressTask from '@salesforce/apex/TeamTasks_CRUD.handleInProgressTask';
import handleDeleteTasks from '@salesforce/apex/TeamTasks_CRUD.handleDeleteTasks';
import { COLUMNS, PRIORITY_CLASS_MAP } from './teamTasksConst';

export default class TeamTasks extends LightningElement {
    teamTasksWiredResult;
    sortedBy;
    valuePriority = '';
    sortedDirection = 'asc';
    columns = COLUMNS;
    draftValues = [];
    teamTasksList = [];
    datatableKey = 0; // Used to force re-render the datatable
    @track selectedTask = [];

    get optionsPriority() {
        return [
            { label: 'Choose Priority...', value: '' },
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
        ];
    }

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

    handleCreateTask() {
        if (!this.validateForm()) {
            return; // stop here - error messages are already showing on the fields
        }
        
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

    validateForm() {
    // Every Lightning base input/select/record-picker supports reportValidity(),
    // which both returns a boolean AND visually displays the error message
    // under the field - no need to build your own error UI.
        const inputFields = this.template.querySelectorAll(
            '.taskName-input, .taskProject-input, .taskPriority-input, .taskAssignedTo-input, .taskDueDate-input, .taskEstimatedHours-input'
        );

        let isValid = true;

        inputFields.forEach((field) => {
            if (!field.reportValidity()) {
                isValid = false;
            }
        });

        // Custom cross-field / business rule: due date can't be in the past.
        const dueDateField = this.template.querySelector('.taskDueDate-input');
        if (dueDateField.value) {
            const selectedDate = new Date(dueDateField.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                dueDateField.setCustomValidity('Due date cannot be in the past.');
                dueDateField.reportValidity();
                isValid = false;
            } else {
                dueDateField.setCustomValidity(''); // clear any previous custom error
                dueDateField.reportValidity();
            }
        }

        return isValid;
    }

    handleInProgressTask() {
         
        // Implement the logic to mark the selected tasks as "In Progress"
        const idsToUpdate = this.selectedTask.map(task => task.Id);

        handleInProgressTask({ taskIds: idsToUpdate })
        .then(() => {
            // Handle success, e.g., show a success message or refresh the task list
            const dataTable = this.template.querySelector('lightning-datatable');
            if (dataTable) {
                dataTable.selectedRows = [];
            }

        this.selectedTask = []; 
            return refreshApex(this.teamTasksWiredResult);

        })
        .catch((error) => {
            // Handle error, e.g., show an error message
            console.error('Error marking tasks as In Progress:', error);
        });
        // For example, you might want to update their status in the database
    }

    handleDeleteTask() {
        // Implement the logic to delete the selected tasks
        const idsToDelete = this.selectedTask.map(task => task.Id);

        handleDeleteTasks({ taskIds: idsToDelete })
        .then(() => {

            this.selectedTask = [];
            return refreshApex(this.teamTasksWiredResult);
        })
        .catch((error) => {
            // Handle error, e.g., show an error message
            console.error('Error deleting tasks:', error);
        });
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;

        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.teamTasksList = this.sortData(fieldName, sortDirection);
    }

    sortData(fieldName, direction) {
        const data = [...this.teamTasksList];
        const isAsc = direction === 'asc';

        data.sort((a, b) => {
            let valA = a[fieldName] ?? '';
            let valB = b[fieldName] ?? '';

            // Dates and numbers compare fine as-is; strings need lowercasing
            // for a case-insensitive sort.
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return isAsc ? -1 : 1;
            if (valA > valB) return isAsc ? 1 : -1;
            return 0;
        });

        return data;
    }

    handleTasksSelection(event) {
        this.selectedTask = event.detail.selectedRows;
    }

    handleConfirmTask() {}
        // Implement the logic to confirm the selected tasks
        // For example, you might want to update their status or perform some action

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