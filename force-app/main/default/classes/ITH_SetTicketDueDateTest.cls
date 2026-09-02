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
global class ITH_SetTicketDueDateTest {

    @TestSetup
    global static void makeData(){
        IT_Ticket__c ticket1 = new IT_Ticket__c(
            Subject__c = 'Ticket 1',
            Priority__c = 'High',
            Description__c = 'This is a test ticket.',
            Category__c = 'Software',
            Status__c = 'New'
        );

        insert ticket1;
    }
}