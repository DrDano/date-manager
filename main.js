const docLocation = document.location.pathname.split("/").pop();
const CUSTOM_PAGE_NAME = ''
const DATE_RANGE_MAX = docLocation === `${CUSTOM_PAGE_NAME}` ? 31 : 90; /* maximum range allowed */
const SUBMITVALIDATIONMES = `Please use a valid ${DATE_RANGE_MAX}-day range`;
const AUTOCOMPLETE = 'off';
const INPUTSREQUIRED = true;
let input1Min = '01/01/2022';
let input2Min = '01/01/2022';
let input2Max = '01/01/2022';

// function for formatting date strings
function formatDate(date) {
  const dateF = date.split(/[-._,: \/\\]+/);
  dateF.push(dateF[0]);
  dateF.shift();
  const i1F = dateF.join("/");
  return i1F;
} 

function datePicker() {
  // getting input elements to use
  const days = $(".date-manager"); 
  const inputArr = Object.values(days).slice(0, 2);
  const div = days[1].closest("div");
  const input1 = inputArr[0];
  const input2 = inputArr[1];

  // Appending hidden inputs where data stored to be sent to server (allows the user to see one date format while the server recieves another)
  $('input[type="hidden"]').length || $(input1).closest('form').prepend(`<input name=${input1.name} type="hidden">`) && $(input2).closest('form').prepend(`<input name=${input2.name} type="hidden">`);

  // The hidden inputs are what is actually submitted to the server and contain unformatted data from the visible inputs
  // $(input1).closest('form').removeAttr('type');
  const hiddenInput1 = $(`input[name=${input1.name}][type='hidden']`);
  const hiddenInput2 = $(`input[name=${input2.name}][type='hidden']`);
  const date1 = new Date(input1.value).valueOf() || new Date(Date.now());
  const date2 = new Date(input2.value).valueOf() || new Date(Date.now());
  hiddenInput1.val(new Date(date1).toISOString().split("T")[0]);
  hiddenInput2.val(new Date(date2).toISOString().split("T")[0]);
  $(input1).attr({'autocomplete':AUTOCOMPLETE, 'form':'decoyForm', 'type':'text', 'value':formatDate(hiddenInput1.val())});
  $(input2).attr({'autocomplete':AUTOCOMPLETE, 'form':'decoyForm', 'type':'text', 'value':formatDate(hiddenInput2.val())});
  input1['required'] = INPUTSREQUIRED;
  input2['required'] = INPUTSREQUIRED;
  
  const dayDiff = Math.ceil(((date2 - date1) / 1000 / 60 / 60 / 24) + (date2-date1 === 0 && 1));
  $("[name='dayDiff']").remove() || DATE_RANGE_MAX + 1;
  $(div).append(`<sub name='dayDiff'>${dayDiff ? dayDiff + " days" : ""}</sub>`);
  // above variables for setting values of inputs to readable values

  // below conditional statement sets start and end dates for input2, and sets min attribute of input1
  // all validation (date restriction) then handled by bootstrap-datepicker
  if (DATE_RANGE_MAX && days) {
    const parsedNewDateMax = new Date(
      date1 + DATE_RANGE_MAX * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    const parsedNewDateMin = new Date(date1)
      .toISOString()
      .split("T")[0];
    const date1U = new Date(date1 - DATE_RANGE_MAX * 24 * 60 * 60 * 1000 + 2)
      .toISOString()
      .split("T")[0];

    input2Max = input2["max"] = `${formatDate(parsedNewDateMax)}`;
    input2Min = input2["min"] = `${formatDate(parsedNewDateMin)}`;
    input1Min = input1["min"] = `${formatDate(date1U)}`;
  }

  try {
    $('input[name$="date_to"], input[name$="to_date"]').datepicker(
      "setStartDate",
      input2Min
    );
    $('input[name$="date_to"], input[name$="to_date"]').datepicker(
      "setEndDate",
      input2Max
    );
  } catch (error) {
    console.error(error);
  }
  // below is responsible for validation on submission of form and loading spinner
  try {
    submitFormValidator({
      formInput: hiddenInput1,
      validationMes: SUBMITVALIDATIONMES,
      validationCondition: dayDiff <= DATE_RANGE_MAX && dayDiff >= 1,
    });
  } catch (error) {
    console.error(error)
  }
}

try {
  $('input[name$="date_from"], input[name$="from_date"]').datepicker({
    todayBtn: "linked",
    title: "Date From",
    forceParse: false,
    orientation: "bottom right",
    keyboardNavigation: false,
  });
  
  $('input[name$="date_to"], input[name$="to_date"]').datepicker({
    startDate: input2Min,
    endDate: input2Max,
    title: "Date To",
    forceParse: false,
    keyboardNavigation: false,
  });
} catch (error) {
  console.error(error)
}

// if datepicker input exists and is type text, then it will be initialized and re-initialized every time the input is blurred
$(".date-manager").length && datePicker();
$(".date-manager").on({"change": datePicker});