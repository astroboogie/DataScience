import $ from 'jquery';

const setSemesterValues = function(form, semesters) {
    $(form + ' *').filter(':input').each(function(index, element){
        element.value = semesters[index]["endpoint"]
        $(element).parent().find($(".span-object > span")).text(semesters[index]["name"]);
        if (semesters[index]["current"]) {
            $(element).prop('checked', true);
        }
    });
}

export { setSemesterValues };
