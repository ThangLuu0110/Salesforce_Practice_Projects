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
global class ARP_TestSetUp {

    @TestSetup
    global static void ARP_SetupData() {
        Team_Projects__c project1 = new Team_Projects__c(Name = 'Project 1');
        insert project1;

        Team_Members__c member1 = new Team_Members__c(Name = 'Member 1', Team_Members_Email__c = 'member1@example.com');
        insert member1;

        Team_Tasks__c task1 = new Team_Tasks__c(
            Name = 'Task 1',
            Team_Projects__c = project1.Id,
            Tasks_Priority__c = 'High',
            Tasks_Assigned_To__c = member1.Id,
            Tasks_Due_Date__c = Date.today().addDays(7),
            Tasks_Hours_Estimated__c = 5
        );

        insert task1;
    }
}