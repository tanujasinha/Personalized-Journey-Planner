document.addEventListener("DOMContentLoaded", function () {
    console.log("Frontend loaded!");

    const form = document.querySelector("form");
    
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const destination = document.getElementById("destination").value;
            const days = document.getElementById("days").value;
            const budget = document.getElementById("budget").value;

            const interests = [];
            document.querySelectorAll("input[type=checkbox]:checked").forEach((checkbox) => {
                interests.push(checkbox.id);
            });

            const tripData = { destination, days, interests, budget };

            try {
                const response = await fetch("http://localhost:5001/api/trip/plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(tripData)
                });

                const result = await response.json();
                console.log("Trip Planned:", result);

                // Display response data (modify as needed)
                alert(`Trip to ${result.destination} planned successfully!`);
            } catch (error) {
                console.error("Error:", error);
            }
        });
    }
});
