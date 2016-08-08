
$(document).ready(function() { 

alert("Hello");

    $('#mcq').submit( function() {
        var answer1 = $("input[name=answer1]:checked").val();
        var answer2 = $("input[name=answer2]:checked").val();
        var answer3 = $("input[name=answer3]:checked").val();
        

        $("#answers").prop("disabled",true);
            $('input[name=answer1]').attr("disabled",true);
            $('input[name=answer2]').attr("disabled",true);
            $('input[name=answer3]').attr("disabled",true);
            
if(answer_one == 4) {
        $("#first").append("Correct");
    }
    else {
        $("#first").append("InCorrect! Correct answer is 4.");
    }

    if(answer_two == 12) {
        $("#second").append("Correct");
    }
    else {
        $("#second").append("InCorrect! Correct answer is 12.");
    }

    if(answer_three == 1) {
        $("#third").append("Correct");
    }
    else {
        $("#third").append("InCorrect! Correct answer is 1.");
    }

           

    }

}

