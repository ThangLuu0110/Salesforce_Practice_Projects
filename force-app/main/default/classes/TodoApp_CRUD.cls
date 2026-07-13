public class TodoApp_CRUD {
    //Get all the todo tasks from the database
    @AuraEnabled(cacheable=true)
    public static List<Todo_Tasks__c> getAllTodoTasks(){
        
        List<Todo_Tasks__c> todoTasks = [SELECT Name, Tasks_Status__c, Tasks_Start_Date__c FROM Todo_Tasks__c];
        
        return todoTasks;
    }
} 