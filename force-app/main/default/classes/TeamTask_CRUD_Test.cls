/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
private class TeamTask_CRUD_Test {

    @testSetup
    static void setupTestData() {
        // Create test data for Team_Projects__c
        Team_Projects__c project1 = new Team_Projects__c(Name = 'Project 1');
        Team_Projects__c project2 = new Team_Projects__c(Name = 'Project 2');
        insert new List<Team_Projects__c>{project1, project2};

        Team_Members__c member1 = new Team_Members__c(Name = 'Member 1', Team_Members_Email__c = 'member1@example.com');
        Team_Members__c member2 = new Team_Members__c(Name = 'Member 2', Team_Members_Email__c = 'member2@example.com');
        insert new List<Team_Members__c>{member1, member2};

        // Create test data for Team_Tasks__c
        Team_Tasks__c task1 = new Team_Tasks__c(
            Name = 'Task 1',
            Team_Projects__c = project1.Id,
            Tasks_Priority__c = 'High',
            Tasks_Assigned_To__c = member1.Id,
            Tasks_Due_Date__c = Date.today().addDays(7),
            Tasks_Hours_Estimated__c = 5
        );

        Team_Tasks__c task2 = new Team_Tasks__c(
            Name = 'Task 2',
            Team_Projects__c = project2.Id,
            Tasks_Priority__c = 'Medium',
            Tasks_Assigned_To__c = member2.Id,
            Tasks_Due_Date__c = Date.today().addDays(14),
            Tasks_Hours_Estimated__c = 3
        );

        insert new List<Team_Tasks__c>{task1, task2};
    }

    @isTest
    static void testGetAllTeamTasks() {
        List<Team_Tasks__c> tasks = TeamTasks_CRUD.getAllTeamTasks();
        System.assertEquals(2, tasks.size(), 'Expected 2 tasks to be returned');
    }

    @isTest
    static void testGetAllTeamProjects() {
        List<Team_Projects__c> projects = TeamTasks_CRUD.getAllTeamProjects();
        System.assertEquals(2, projects.size(), 'Expected 2 projects to be returned');
    }

    @isTest
    static void testGetAllTeamMembers() {
        List<Team_Members__c> members = TeamTasks_CRUD.getAllTeamMembers();
        System.assertEquals(2, members.size(), 'Expected 2 members to be returned');
    }

    @isTest
    static void testHandleCreateTask() {
        String taskName = 'New Task';
        String taskProject = [SELECT Id FROM Team_Projects__c LIMIT 1].Id;
        String taskPriority = 'Low';
        String taskAssignedTo = [SELECT Id FROM Team_Members__c LIMIT 1].Id;
        Date taskDueDate = Date.today().addDays(10);
        Decimal taskEstimatedHours = 4;

        Test.startTest();
        TeamTasks_CRUD.handleCreateTask(taskName, taskProject, taskPriority, taskAssignedTo, taskDueDate, taskEstimatedHours);
        Test.stopTest();

        List<Team_Tasks__c> tasks = [SELECT Name, Team_Projects__c, Tasks_Priority__c, Tasks_Assigned_To__c, Tasks_Due_Date__c, Tasks_Hours_Estimated__c FROM Team_Tasks__c WHERE Name = :taskName];
        System.assertEquals(1, tasks.size(), 'Expected 1 task to be created');
        System.assertEquals(taskProject, tasks[0].Team_Projects__c, 'Expected project to match');
        System.assertEquals(taskPriority, tasks[0].Tasks_Priority__c, 'Expected priority to match');
        System.assertEquals(taskAssignedTo, tasks[0].Tasks_Assigned_To__c, 'Expected assigned to to match');
        System.assertEquals(taskDueDate, tasks[0].Tasks_Due_Date__c, 'Expected due date to match');
        System.assertEquals(taskEstimatedHours, tasks[0].Tasks_Hours_Estimated__c, 'Expected estimated hours to match');
    }

    @isTest
    static void testHandleCreateTaskWithInvalidData() {
        String taskName = null; // Invalid data: Name is required
        String taskProject = [SELECT Id FROM Team_Projects__c LIMIT 1].Id;
        String taskPriority = 'Low';
        String taskAssignedTo = [SELECT Id FROM Team_Members__c LIMIT 1].Id;
        Date taskDueDate = Date.today().addDays(10);
        Decimal taskEstimatedHours = 4; 

        Test.startTest();
        try {
            TeamTasks_CRUD.handleCreateTask(taskName, taskProject, taskPriority, taskAssignedTo, taskDueDate, taskEstimatedHours);
            System.assert(true, 'Expected an exception to be thrown for invalid task data');
        } catch (DmlException e) {  
            System.assert(e.getMessage().contains('Required fields are missing'), 'Expected exception message for invalid task data');
        }
        Test.stopTest();
    }

    @isTest
    static void testHandleCreateTaskWithInvalidProject() {
        String taskName = 'New Task';
        String taskProject = 'a01fj00001f1WdeAAR'; // Invalid project ID
        String taskPriority = 'Low';
        String taskAssignedTo = [SELECT Id FROM Team_Members__c LIMIT 1].Id;
        Date taskDueDate = Date.today().addDays(10);
        Decimal taskEstimatedHours = 4;

        Test.startTest();
        try {
            TeamTasks_CRUD.handleCreateTask(taskName, taskProject, taskPriority, taskAssignedTo, taskDueDate, taskEstimatedHours);
            System.assert(true, 'Expected an exception to be thrown for invalid project ID');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('Insert failed'), 'Expected exception message for invalid project ID');
        }
        Test.stopTest();
    }
    
    @isTest
    static void testHandleCreateTaskWithInvalidAssignedTo() {
        String taskName = 'New Task';
        String taskProject = [SELECT Id FROM Team_Projects__c LIMIT 1].Id;
        String taskPriority = 'Low';
        String taskAssignedTo = 'a02fj00001WG0fRAAT'; // Invalid member ID 
        Date taskDueDate = Date.today().addDays(10);
        Decimal taskEstimatedHours = 4;

        Test.startTest();
        try {
            TeamTasks_CRUD.handleCreateTask(taskName, taskProject, taskPriority, taskAssignedTo, taskDueDate, taskEstimatedHours);
            System.assert(true, 'Expected an exception to be thrown for invalid assigned-to ID');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('Insert failed'), 'Expected exception message for invalid assigned-to ID');
        }
        Test.stopTest();
    }

    @isTest
    static void testHandleInProgressTask() {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id, Name, Tasks_Status__c FROM Team_Tasks__c LIMIT 1];
        tasksToUpdate[0].Tasks_Status__c = 'In Progress';
        update tasksToUpdate;

        List<Team_Tasks__c> updatedTasks = [SELECT Id, Tasks_Status__c FROM Team_Tasks__c WHERE Id = :tasksToUpdate[0].Id];
        System.assertEquals('In Progress', updatedTasks[0].Tasks_Status__c, 'Expected task status to be updated to In Progress');
    }

    @isTest
    static void testHandleInProgressTaskWithValidIds() {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id FROM Team_Tasks__c LIMIT 2];
        List<Id> taskIds = new List<Id>();
        for (Team_Tasks__c task : tasksToUpdate) {
            taskIds.add(task.Id);
        }

        Test.startTest();
        TeamTasks_CRUD.handleInProgressTask(taskIds);
        Test.stopTest();

        List<Team_Tasks__c> updatedTasks = [SELECT Id, Tasks_Status__c FROM Team_Tasks__c WHERE Id IN :taskIds];
        for (Team_Tasks__c task : updatedTasks) {
            System.assertEquals('In Progress', task.Tasks_Status__c, 'Expected task status to be updated to In Progress');
        }
    }

    @isTest
    static void testHandleInProgressTaskWithInvalidId() {
        List<Id> invalidTaskIds = new List<Id>{'a00fj0000000000AAA'}; // Assuming this ID does not exist    
        Test.startTest();
        try {
            TeamTasks_CRUD.handleInProgressTask(invalidTaskIds);
            System.assert(true, 'Expected an exception to be thrown for invalid task ID');
        } catch (Exception e) {
            System.assert(e.getMessage().contains('List has no rows for assignment to SObject'), 'Expected exception message for invalid task ID');
        }
        Test.stopTest();
    }

    @isTest
    static void testHandleInProgressTaskWithEmptyList() {
        List<Id> emptyTaskIds = new List<Id>();
        Test.startTest();
        TeamTasks_CRUD.handleInProgressTask(emptyTaskIds);
        Test.stopTest();
        // Verify that no tasks were updated
        List<Team_Tasks__c> tasks = [SELECT Id, Tasks_Status__c FROM Team_Tasks__c];
        for (Team_Tasks__c task : tasks) {
            System.assertNotEquals('In Progress', task.Tasks_Status__c, 'Expected no tasks to be updated to In Progress when empty list is provided');
        }
    }

    
    @isTest
    static void testHandleUpdateTasks() {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id, Name, Tasks_Status__c FROM Team_Tasks__c LIMIT 1];
        tasksToUpdate[0].Name = 'Test Updated Task';
        update tasksToUpdate;

        List<Team_Tasks__c> updatedTasks = [SELECT Id, Name FROM Team_Tasks__c WHERE Id = :tasksToUpdate[0].Id];
        System.assertEquals('Test Updated Task', updatedTasks[0].Name, 'Expected task name to be updated');
    }

    @isTest
    static void testHandleUpdateTasksWithErrors() {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id, Name, Tasks_Status__c FROM Team_Tasks__c LIMIT 1];
        tasksToUpdate[0].Name = null; // Setting a required field to null to cause an error
        Test.startTest();
        try {
            update tasksToUpdate;
            System.assert(true, 'Expected an exception to be thrown for invalid task data');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('Required fields are missing'), 'Expected exception message for invalid task data');
        }
        Test.stopTest();
    }  
    
    @isTest
    static void testHandleUpdateTasksWithEmptyList() {
        List<Team_Tasks__c> emptyTasks = new List<Team_Tasks__c>();
        Test.startTest();
        TeamTasks_CRUD.handleUpdateTasks(emptyTasks);
        Test.stopTest();
        // Verify that no tasks were updated
        List<Team_Tasks__c> tasks = [SELECT Id, Name FROM Team_Tasks__c];
        System.assertEquals(2, tasks.size(), 'Expected no tasks to be updated when empty list is provided');
    }

    @isTest
    static void testHandleUpdateTasksWithInvalidId() {
        Team_Tasks__c invalidTask = new Team_Tasks__c(
            Id = 'a03fj00001WGUn1234', // Assuming this ID does not exist
            Name = 'Invalid Task'
        );
        List<Team_Tasks__c> tasksToUpdate = new List<Team_Tasks__c>{invalidTask};
        Test.startTest();
        try {
            TeamTasks_CRUD.handleUpdateTasks(tasksToUpdate);
            System.assert(true, 'Expected an exception to be thrown for invalid task ID');
        } catch (AuraHandledException e) {
            System.assert(true, 'Row 1: Record ID: id value of incorrect type: ' + invalidTask.Id);
        }
        Test.stopTest();   
    }

    @isTest
    static void testHandleUpdateTasksWithMixedValidAndInvalidIds() {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id, Name FROM Team_Tasks__c LIMIT 1];
        Team_Tasks__c invalidTask = new Team_Tasks__c(
            Id = 'a03fj00001WGUn1232', // Assuming this ID does not exist
            Name = 'Invalid Task'
        );
        tasksToUpdate.add(invalidTask);
        Test.startTest();
        try {
            TeamTasks_CRUD.handleUpdateTasks(tasksToUpdate);
            System.assert(true, 'Expected an exception to be thrown for mixed valid and invalid task IDs');
        } catch (AuraHandledException e) {  
            System.assert(true, 'Row 2: Record ID: id value of incorrect type: ' + invalidTask.Id);
        }
        Test.stopTest();
    }

    @isTest
    static void testHandleUpdateTasksWithNullList() {
        List<Team_Tasks__c> nullTasks = null;
        Test.startTest();
        try {
            TeamTasks_CRUD.handleUpdateTasks(nullTasks);
            System.assert(false, 'Expected an exception to be thrown for null task list');
        } catch (NullPointerException e) {
            System.assert(e.getMessage().contains('Attempt to de-reference a null object'), 'Expected exception message for null task list');
        }
        Test.stopTest();
    }

    @isTest
    static void testHandleUpdateTasksWithLargeList() {
        List<Team_Tasks__c> tasksToUpdate = [SELECT Id, Name FROM Team_Tasks__c LIMIT 200];
        for (Integer i = 0; i < tasksToUpdate.size(); i++) {
            tasksToUpdate[i].Name = 'Updated Task ' + i;
        }
        Test.startTest();
        TeamTasks_CRUD.handleUpdateTasks(tasksToUpdate);
        Test.stopTest();
        List<Team_Tasks__c> updatedTasks = [SELECT Id, Name FROM Team_Tasks__c WHERE Id IN :tasksToUpdate];
        for (Integer i = 0; i < updatedTasks.size(); i++) {
            System.assertEquals('Updated Task ' + i, updatedTasks[i].Name, 'Expected task name to be updated for task ' + i);
        }
    }

    @isTest
    static void testHandleDeleteTasks() {
        List<Team_Tasks__c> tasksToDelete = [SELECT Id FROM Team_Tasks__c LIMIT 1];
        Test.startTest();
        TeamTasks_CRUD.handleDeleteTasks(new List<Id>{tasksToDelete[0].Id});
        Test.stopTest();
        List<Team_Tasks__c> deletedTasks = [SELECT Id FROM Team_Tasks__c WHERE Id = :tasksToDelete[0].Id];
        System.assertEquals(0, deletedTasks.size(), 'Expected task to be deleted');
    }
}   