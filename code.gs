const PARENT_FOLDER_ID = "<<YOUR FOLDER ID>>";

const initialize = () => {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();
};

const onFormSubmit = ({ response } = {}) => {
  try {
    // List of responses of the form
    const itemResponses = response.getItemResponses();

    // Get a list of all files uploaded with the response
    const files = itemResponses
      // We are only interested in File Upload type of questions
      .filter(
        (itemResponse) =>
          itemResponse.getItem().getType().toString() === "FILE_UPLOAD"
      )
      .map((itemResponse) => itemResponse.getResponse())
      // The response includes the file ids in an array that we can flatten
      .reduce((a, b) => [...a, ...b], []);

    if (files.length > 0) {
      // Each form response has a unique Id
      const fullName = itemResponses[0].getResponse() + " " + itemResponses[1].getResponse();
      const carnet = itemResponses[2].getResponse();

      const subfolderName = carnet + " - " + fullName;

      const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      let subfolder;
      // We check if the subfolder already exists
      var checkSubfolder = parentFolder.getFoldersByName(subfolderName);
      if (checkSubfolder.hasNext()) {
        subfolder = checkSubfolder.next();
      } else {
        subfolder = parentFolder.createFolder(subfolderName);
      }
      
      // assigns the files to the folder
      files.forEach((fileId, i) => {
        // We get the object of the file
        let file = DriveApp.getFileById(fileId);

        // Move each file into the custom folder
        file.moveTo(subfolder);
      });
    }
  } catch (f) {
    Logger.log(f);
