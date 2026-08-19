export const COLUMNS = [
    { 
        label: 'Task Name', 
        fieldName: 'Name', 
        type: 'text', 
        wrapText: true, 
        editable: true,
        sortable: true
 },
    { 
        label: 'Project', 
        fieldName: 'Team_Projects__c', 
        type: 'text' },
    {
        label: 'Priority',
        fieldName: 'Tasks_Priority__c',
        type: 'text',
        cellAttributes: {
            class: { fieldName: 'priorityClass' }
        },
        sortable: true,
    },
    { 
        label: 'Due Date', 
        fieldName: 'Tasks_Due_Date__c', 
        type: 'date-local', 
        editable: true,
        sortable: true,
    },
    { 
        label: 'Assigned To', 
        fieldName: 'Tasks_Assigned_To__c', 
        type: 'text' 
    },
    { 
        label: 'Status', 
        fieldName: 'Tasks_Status__c', 
        type: 'text',
        sortable: true
    },
    {
        label: 'Estimated Hours',
        fieldName: 'Tasks_Hours_Estimated__c',
        type: 'number',
        typeAttributes: { minimumFractionDigits: 1 },
        cellAttributes: { alignment: 'left' },
        editable: true
    }
];

export const PRIORITY_CLASS_MAP = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low'
};