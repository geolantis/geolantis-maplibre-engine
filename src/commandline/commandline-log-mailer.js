/**
 * Ultra-simplified email feature for map logs
 *
 * This version fixes the "Web page not available" error by using
 * a much simpler approach without complicated URLs
 */

// Check if the command line exists
if (window.mapConsole) {
  // Add the fixed email function
  window.mapConsole.emailLogs = function (emailAddress) {
    if (
      !window.mapFeatureLogs ||
      (window.mapFeatureLogs.entries &&
        window.mapFeatureLogs.entries.length === 0)
    ) {
      window.mapConsole.addOutput(
        "No feature logs available to email",
        "#ffaa00"
      );
      return;
    }

    try {
      // Validate email format with a simple regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        window.mapConsole.addOutput(
          `Invalid email address format: ${emailAddress}`,
          "#ff0000"
        );
        return;
      }

      // Format logs as JSON
      const logsJson = JSON.stringify(window.mapFeatureLogs.entries, null, 2);

      // Create a Blob with the logs
      const blob = new Blob([logsJson], { type: "application/json" });

      // Create the file name
      const fileName = `map_feature_logs_${new Date()
        .toISOString()
        .replace(/:/g, "-")}.json`;

      // Create download URL
      const downloadUrl = URL.createObjectURL(blob);

      // Create container for content
      const container = document.createElement("div");
      container.style.margin = "10px 0";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "10px";

      // 1. Create button to download the file
      const downloadButton = document.createElement("button");
      downloadButton.textContent = `Download Log File`;
      downloadButton.style.padding = "8px 16px";
      downloadButton.style.backgroundColor = "#4285f4";
      downloadButton.style.color = "white";
      downloadButton.style.border = "none";
      downloadButton.style.borderRadius = "4px";
      downloadButton.style.cursor = "pointer";
      downloadButton.style.fontFamily = "inherit";

      downloadButton.onclick = function () {
        // Create temporary link and click it
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);

        downloadButton.textContent = "✓ Log file downloaded";
        downloadButton.style.backgroundColor = "#00aa00";

        // Show the copy section
        emailInfoSection.style.display = "block";
      };

      // Email info box (initially hidden)
      const emailInfoSection = document.createElement("div");
      emailInfoSection.style.marginTop = "10px";
      emailInfoSection.style.padding = "10px";
      emailInfoSection.style.backgroundColor = "rgba(255,255,255,0.1)";
      emailInfoSection.style.borderRadius = "4px";
      emailInfoSection.style.display = "none"; // Initially hidden

      // Get current date/time for email subject
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();

      // Calculate some stats for email body
      const totalEntries = window.mapFeatureLogs.entries.length;
      const methodCounts = {};
      window.mapFeatureLogs.entries.forEach((entry) => {
        methodCounts[entry.method] = (methodCounts[entry.method] || 0) + 1;
      });

      let methodsList = "";
      Object.entries(methodCounts).forEach(([method, count]) => {
        methodsList += `- ${method}: ${count} calls\n`;
      });

      // Create email templates
      const emailSubject = `Map Feature Logs (${dateStr})`;
      const emailBody =
        `Map Feature Logs Summary\n\n` +
        `Date: ${dateStr} ${timeStr}\n` +
        `Total Entries: ${totalEntries}\n\n` +
        `Method Summary:\n${methodsList}\n` +
        `Please find the attached log file for details.`;

      // Create the HTML for the email info
      emailInfoSection.innerHTML = `
          <p style="margin: 0 0 10px 0; color: #ffaa00; font-weight: bold;">Email Information:</p>
          <p style="color: #ffffff;">To: ${emailAddress}</p>
          <p style="color: #ffffff;">Subject: ${emailSubject}</p>
          <p style="color: #ffffff;">Body:</p>
          <pre style="background-color: rgba(0,0,0,0.3); padding: 8px; color: #dddddd; max-height: 150px; overflow-y: auto;">${emailBody}</pre>
          <p style="margin-top: 10px; color: #ffffff;">Open your email client, create a new message using the information above, and attach the downloaded file.</p>
        `;

      // Add elements to container
      container.appendChild(downloadButton);
      container.appendChild(emailInfoSection);

      // Add instructions
      const instructions = document.createElement("div");
      instructions.style.marginTop = "10px";
      instructions.style.padding = "10px";
      instructions.style.backgroundColor = "rgba(255,255,255,0.1)";
      instructions.style.borderRadius = "4px";
      instructions.innerHTML = `
          <p style="margin: 0 0 10px 0; color: #ffaa00; font-weight: bold;">How to send logs via email:</p>
          <ol style="margin: 0; padding-left: 20px; color: #ffffff;">
            <li>Click "Download Log File" to save the logs to your device</li>
            <li>Once downloaded, email info will appear with subject and body to copy</li>
            <li>Create a new email in your email application</li>
            <li>Use the provided subject and body text</li>
            <li>Attach the downloaded file</li>
            <li>Send the email</li>
          </ol>
        `;
      container.appendChild(instructions);

      // Add container to output
      const outputContainer = document.getElementById("cli-output");
      if (outputContainer) {
        outputContainer.appendChild(container);
        window.mapConsole.addOutput(
          `Preparing to email logs to ${emailAddress}`,
          "#00ff00"
        );
      } else {
        window.mapConsole.addOutput(
          "Could not create email tools. Please try 'log save' instead.",
          "#ff0000"
        );
      }
    } catch (error) {
      window.mapConsole.addOutput(
        `Error preparing email: ${error.message}`,
        "#ff0000"
      );
      console.error("Error preparing email with logs:", error);
    }
  };

  // Add a command handler for 'email' to the log command
  const originalHandleLogCommand = window.mapConsole.handleLogCommand;
  if (originalHandleLogCommand) {
    window.mapConsole.handleLogCommand = function (args) {
      const subCmd = args.length > 0 ? args[0].toLowerCase() : "help";

      if (subCmd === "email") {
        if (args.length < 2) {
          window.mapConsole.addOutput(
            "Please specify an email address",
            "#ff0000"
          );
          window.mapConsole.addOutput(
            "Usage: log email yourname@example.com",
            "#aaaaaa"
          );
          return;
        }
        window.mapConsole.emailLogs(args[1]);
        return;
      }

      // Handle everything else with the original function
      originalHandleLogCommand.call(this, args);
    };
  }

  // Make sure 'log help' shows the email command
  const helpTexts = [
    "log email <address> - Create tools to email your logs to the specified address",
    "log email yourname@example.com - Export logs to email",
  ];

  // Find all places where help text might be defined
  function addEmailToHelp() {
    try {
      // If the mapConsole object has methods that might contain help text,
      // add our help text to their output
      if (window.mapConsole.showHelp) {
        const originalShowHelp = window.mapConsole.showHelp;
        window.mapConsole.showHelp = function () {
          originalShowHelp.call(this);
          this.addOutput(
            "\nAdditional commands:\n" + helpTexts.join("\n"),
            "#00ff00"
          );
        };
      }
    } catch (e) {
      console.error("Error adding email to help text:", e);
    }
  }

  // Try to add to help
  addEmailToHelp();

  console.log(
    "Ultra-simplified email functionality for map logs has been added"
  );
} else {
  console.warn("Command line not found - email function could not be added");
}
