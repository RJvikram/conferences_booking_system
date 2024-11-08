alert("calling")
frappe.ui.form.on('Conference Booking', {
    start_time: function(frm) {
        frm.trigger('validate_start_time');
        frm.trigger('calculate_duration');
    },
    end_time: function(frm) {
        frm.trigger('calculate_duration');  // Recalculate duration when end time is updated
    },
    date: function(frm) {
        frm.trigger('validate_date');
    },
    validate_start_time: function(frm) {
        if (frm.doc.start_time) {
            // Get the current date and time, rounded to the nearest minute
            const current_date_time = moment().startOf('minute'); // Round to the nearest minute

            // Get the selected date from the form; if not present, use today
            const form_date = frm.doc.date || frappe.datetime.get_today();
            // Combine form date with selected start time to create a moment object
            const selected_start_time = moment(`${form_date} ${frm.doc.start_time}`, "YYYY-MM-DD HH:mm").startOf('minute'); // Round to the nearest minute

            // Compare the selected start time with the current date and time
            if (selected_start_time.isBefore(current_date_time)) {
                frappe.msgprint(__('Start time cannot be in the past.'));
                frm.set_value('start_time', '');

                // Optionally, disable the save button until a valid time is selected
                frm.disable_save();
            } else if (selected_start_time.isSame(current_date_time)) {
                // If the start time is exactly the current time, allow it
                frm.enable_save();
            } else {
                // Enable save button if the start time is valid
                frm.enable_save();
            }
        }
    },
    validate_date: function(frm) {
        // Get today's date
        const current_date = moment().format('YYYY-MM-DD'); 

        // Ensure that a past date cannot be selected
        if (frm.doc.date && moment(frm.doc.date).isBefore(current_date)) {
            frm.set_value('date', current_date);  // Set to today's date if a past date is selected
        }
    },
    calculate_duration: function(frm) {
        if (frm.doc.start_time && frm.doc.end_time) {
            // Get the selected date from the form; if not present, use today
            const form_date = frm.doc.date || frappe.datetime.get_today();
            
            // Combine start time and end time with the selected date
            const startTime = moment(`${form_date} ${frm.doc.start_time}`, "YYYY-MM-DD HH:mm");
            const endTime = moment(`${form_date} ${frm.doc.end_time}`, "YYYY-MM-DD HH:mm");

            // Calculate the duration in minutes
            const durationMinutes = endTime.diff(startTime, 'minutes');

            if (durationMinutes >= 0) {
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                frm.set_value('duration', `${hours} hours ${minutes} minutes`);
            } else {
                frappe.msgprint(__('End time must be after start time.'));
                frm.set_value('duration', '');
            }
        } else {
            // If either start_time or end_time is missing, clear the duration field
            frm.set_value('duration', '');
        }
    },
    refresh: function(frm) {
        // Apply the restriction immediately when the form loads
        const today = frappe.datetime.get_today();
        
        // Use jQuery to apply a min date on the input field to disable past dates
        $(frm.fields_dict['date'].input).attr("min", today);
        
        // Initialize the datepicker with minimum date set to today
        $(frm.fields_dict['date'].input).datepicker('destroy').datepicker({
            minDate: new Date(today) // Disables past dates
        });
    }
});


