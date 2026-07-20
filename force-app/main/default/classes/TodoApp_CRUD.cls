public class TodoApp_CRUD {
    //Get all the todo tasks from the database
    @AuraEnabled(cacheable=true)
    public static List<Todo_Tasks__c> getAllTodoTasks(){
        
        List<Todo_Tasks__c> todoTasks = [SELECT Id, Name, Tasks_Status__c, Tasks_Deadline__c FROM Todo_Tasks__c];
        
        return todoTasks;
    }

    @AuraEnabled(cacheable=false)
    public static void addNewTodoTask(String taskName, Date taskDeadline){
        Todo_Tasks__c newTask = new Todo_Tasks__c(
            Name = taskName,
            Tasks_Deadline__c = taskDeadline
        );
        
        insert newTask;
    }

    @AuraEnabled(cacheable=false)
    public static void deleteTodoTask(Id taskId){
        Todo_Tasks__c taskToDelete = [SELECT Id FROM Todo_Tasks__c WHERE Id = :taskId LIMIT 1];
        
        delete taskToDelete;
    }

    @AuraEnabled(cacheable=false)
    public static void updateTodoTask(Id taskId, String taskName, Date taskDeadline){
        Todo_Tasks__c taskToUpdate = [SELECT Id, Name, Tasks_Deadline__c FROM Todo_Tasks__c WHERE Id = :taskId LIMIT 1];
        
        taskToUpdate.Name = taskName;
        taskToUpdate.Tasks_Deadline__c = taskDeadline;
        
        update taskToUpdate;
    }
} 