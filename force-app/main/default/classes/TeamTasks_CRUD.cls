public with sharing class TeamTasks_CRUD {
    public TeamTasks_CRUD() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Team_Tasks__c> getAllTeamTasks() {
        List<Team_Tasks__c> teamTasks = [
            SELECT Id, Name, Team_Projects__r.Name, 
            Tasks_Priority__c, Tasks_Due_Date__c, 
            Tasks_Assigned_To__r.Name, Tasks_Status__c, 
            Tasks_Hours_Estimated__c 
            FROM Team_Tasks__c
            WHERE Tasks_Status__c != 'Done'
        ];

        return teamTasks;
    }

    @AuraEnabled(cacheable=false)
    public static void handleCreateTask(
        String taskName,
        String taskProject,
        String taskPriority, 
        String taskAssignedTo, 
        Date taskDueDate, 
        Decimal taskEstimatedHours
    ) {
        Team_Tasks__c newTask = new Team_Tasks__c(
            Name = taskName,
            Team_Projects__c = taskProject,
            Tasks_Priority__c = taskPriority,
            Tasks_Assigned_To__c = taskAssignedTo,
            Tasks_Due_Date__c = taskDueDate,
            Tasks_Hours_Estimated__c = taskEstimatedHours
        );
        
        insert newTask;
    }

    @AuraEnabled(cacheable=false)
    public static void handleUpdateTasks(List<Team_Tasks__c> tasks) {
        List<Database.SaveResult> results = Database.update(tasks, false);

        List<String> errors = new List<String>();
        for (Integer i = 0; i < results.size(); i++) {
            if (!results[i].isSuccess()) {
                for (Database.Error err : results[i].getErrors()) {
                    errors.add('Row ' + (i + 1) + ': ' + err.getMessage());
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new AuraHandledException(String.join(errors, '; '));
        }
    }

    @AuraEnabled(cacheable=false)
    public static void handleInProgressTask(List<Id> taskIds) {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id, Tasks_Status__c FROM Team_Tasks__c WHERE Id IN :taskIds];
        
        for (Team_Tasks__c task : tasksToUpdate) {
            task.Tasks_Status__c = 'In Progress';
        }
        
        update tasksToUpdate;
    }

    @AuraEnabled(cacheable=false)
    public static void handleDeleteTasks(List<Id> taskIds) {
        List<Team_Tasks__c> tasksToDelete = [SELECT Id FROM Team_Tasks__c WHERE Id IN :taskIds];
        delete tasksToDelete;
    }
}