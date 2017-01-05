import $ from 'jquery';

const fetchData = function(directory, file = "") {
    let url = "https://s3-us-west-1.amazonaws.com/flc-app-data/" + directory + file + ".json";
    return $.ajax({
        url: url,
        type: "GET",
    });
}

export { fetchData };
