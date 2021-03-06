/*
This script can be used to bulk delete emails with following conditions:
- specific labels assigned to them and received before a specific number of days
- configurations can be adjusted to choose whether the starred emails can be deleted
This script can also be configured to auto triggered every few days without user interaction to bulk delete the emails tagged under the labels as configured in this script.
Refer to this video for further instructions: https://www.loom.com/share/8327a90838ea4c058c78ff69b00cd5c7
*/


function cleanEmailsByLabel() {

  //Configurations to edit
  var labels = ['label 1','label 2','label 3']; //add labels that you want to auto delete. example format: ['label 1', 'label 2', 'label 3']
  var delayDays = 30; // Trash only emails more than 30 days old. Change the number if you want to change the number of days.
  var retainMarkedAsStarred = true; //change this to false if you are ok with trashing even the emails that are starred


//
//DO NOT EDIT ANYTHING AFTER THIS
//

  //calculate date for filtering emails
  var maxDate = new Date();
  maxDate.setDate(maxDate.getDate()-delayDays); // what was the date at that time?
  
  //construct condition
  var filterCondition = "threads[j].getLastMessageDate() >= maxDate";
  filterCondition = retainMarkedAsStarred === true ? filterCondition.concat(" || threads[j].hasStarredMessages() === true") : null;

  //get threads based on labels
  var threads = [];
  for (var i = 0; i < labels.length; i++)
  {
    var label = GmailApp.getUserLabelByName(labels[i]);
    try
    {
      var tempThreads = label.getThreads(0, 400);
      threads = threads.concat(tempThreads);
    }
    catch(e)
    {
      Logger.log("Looks like the mentioned label '%s' is not yet created and applied to any of the threads. Please label the emails properly and try again. Refer to this video on how to apply labels to threads: https://www.loom.com/share/e4787a5f501d490db3fd13d2675842de", labels[i]);
    }    
  }
  console.info('Total number of Gmail threads with the valid mentioned labels: %d', threads.length);

  //filter threads based on conditions
  var threadsToRemove = [];
  for (var j = 0; j < threads.length; j++) {
    if (eval(filterCondition))
    {
      threadsToRemove.push(j);
    }
  }


  //delete filtered threads
  var filteredThreads = threads;

  for (var k = 0; k < threadsToRemove.length; k++)
  {
    var indexNumber = threadsToRemove[k] - k;    
    filteredThreads.splice(indexNumber,1);
  }
  console.info('Number of Gmail threads to be trashed based on the configurations set: %d', filteredThreads.length);

  // we split the array if its size more than 100 
  if (filteredThreads.length > 100) {
      var splitThreads = [];
      for (var i = 0; i < filteredThreads.length; i++) {
          splitThreads.push(filteredThreads[i]);
          if (i == 99 || i == filteredThreads.length - 1) {
              GmailApp.moveThreadsToTrash(splitThreads);
              if (i == 99)
              {
                console.info('Moving %d threads out of %d to trash. Please wait to trash the rest!', splitThreads.length, filteredThreads.length);
              }
              else{
                console.info('Moved all %d threads to trash. Completed!', filteredThreads.length);
              }              
              splitThreads = [];
          }
      }
  } else {
      GmailApp.moveThreadsToTrash(filteredThreads);
      console.info('Moved %d threads to trash', filteredThreads.length);
  }
}
