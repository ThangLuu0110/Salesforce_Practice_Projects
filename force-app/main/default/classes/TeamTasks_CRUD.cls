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
        Integer taskEstimatedTime
    ) {
        Team_Tasks__c newTask = new Team_Tasks__c(
            Name = taskName,
            Team_Projects__c = taskProject,
            Tasks_Priority__c = taskPriority,
            Tasks_Assigned_To__c = taskAssignedTo,
            Tasks_Due_Date__c = taskDueDate,
            Tasks_Hours_Estimated__c = taskEstimatedTime
        );
        
        insert newTask;
    }
}