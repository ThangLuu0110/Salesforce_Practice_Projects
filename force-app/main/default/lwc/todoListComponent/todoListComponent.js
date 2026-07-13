import { LightningElement, wire } from 'lwc';
import getAllTodoTasks from '@salesforce/apex/TodoApp_CRUD.getAllTodoTasks';
import TASK_NAME from '@salesforce/schema/Todo_Tasks__c.Name';
import TASK_STATUS from '@salesforce/schema/Todo_Tasks__c.Tasks_Status__c';
import TASK_START_DATE from '@salesforce/schema/Todo_Tasks__c.Tasks_Start_Date__c';

export default class TodoListComponent extends LightningElement {
    title = 'Todo List';
    objectApiName = 'Todo_Tasks__c';
    fields = [TASK_NAME, TASK_STATUS, TASK_START_DATE];
    recordId = '';

    @wire(getAllTodoTasks) todoTasks;


}