# MYNA-Web

## About

The Myna-web form builder is a web based application built in Ruby on Rails and AngularJS. It allows users to design EGRA and EGMA surveys that can be administered using the Myna-mobile application running on Android / iOS devices.

**For documentation about the FORM BUILDER, DASHBOARDS, or SYSTEM/USER MANAGEMENT, scroll to the section starting with "FORM BUILDER" below.**

## Requirements

To run the form builder the following requirements need to be met by the server:

* Ruby 2.6.3+
* Rails 4.2.11.1
* Postgres 9+
* Nginx
* Graphviz
* Gmail account for mailer service. 
* Access to a CouchDB instance
  * *For getting started and accessing the Futon Admin GUI at your.ip.address:5984/_utils/: <http://guide.couchdb.org/draft/tour.html>*

## Deployment

The app is pre-configured to use [Capistrano](https://github.com/capistrano/capistrano) for deploying to the server but you can use any other method that you prefer. To use capistrano, create a config/deploy/production.rb file and add the server information so capistrano knows how to connect to your server.

## Environment Variables

Rails 5.2+ uses Credendtials to store environment variables. Use `EDITOR='YOUR_TEXT_EDITOR --wait' rails credentials:edit` to edit your applications credentials/keys/env variables. These are accessible via Rails.application.credentials.your_thing[:your_env_variable_key]

 For more information on how that works, use Google or this [Link](https://medium.com/cedarcode/rails-5-2-credentials-9b3324851336).

 For Rails versions 5.1 or less you can use a number of strategies to set your ENV variables as outlined [Here](http://railsapps.github.io/rails-environment-variables.html).

 ### The following environment variables are necessary for the database.yml file:

* DOMAIN_NAME
* GMAIL_USERNAME
* GMAIL_PASSWORD
* FORM_BUILDER_DATABASE_HOST
* FORM_BUILDER_DATABASE_USERNAME (should be set to a postgres superuser with login privileges)
* FORM_BUILDER_DATABASE_PASSWORD
* COUCH_ENCRYPTION_KEY (Must be 32 characters or longer)
* COUCH_DOMAIN={couch domain}
* COUCH_USERNAME={couch user}
* COUCH_PASSWORD={couch password}
* SECRET_KEY_BASE
* MYNA_CLIENT (name of client this application is for)
* MYNA_BANNER (link to a custom banner that you would like to use)

### Steps to run with docker & docker compose files:

```
sudo docker-compose build
sudo docker-compose up
sudo docker-compose run web rake db:setup
```

 ### For an example of setting the ENV variables on an Ubuntu Machine using `./bash_profile`:

 ```bash
$ nano ~/.bash_profile
 ```
Enter the following somewhere in your bash_profile, assuming they do not overlap/conflict with existing environment Variables. Obviously, replace the "your_blah_blah" with your details.
```bash
export DOMAIN_NAME="your.domain.whatever"
export GMAIL_USERNAME="your_username@gmail.com" (can be account as long as it is serviced by gmail smtp)
export GMAIL_PASSWORD="your_gmail_password"
export FORM_BUILDER_DATABASE_USERNAME="your_postgres_username"
export FORM_BUILDER_DATABASE_PASSWORD="your_postgres_password"
export COUNCH_ENCRYPTION_KEY="your_randomly_generated_string (32 characters)"
export SECRET_KEY_BASE="your_rails_secret_key_base"
export MYNA_CLIENT="your_instance_name"
export MYNA_BANNER="your_url_to_banner_image"
```

## Initial Setup

Once you have cloned the app onto your local machine, make sure you have ruby 2.3.3 (or above) and use the following steps to get it working:

*  `cd myna-web`
* Type `bundle install` to install all the required gems
* `rake secret` to get a new secret key from rails. Copy this key.
* Replace the current key in `config.secret_key` in the devise initializer file (`myna-web > config > initializers > devise.rb`) with the new key you just copied.
* Type `rake db:setup` to create the database and seed it
* Type `rails s` in your console to start your rails server.
* Navigate to `http://localhost:3000/` and use the 'Sign Up' link to register and then confirm your account via the confirmation email sent by the application.
* By default you will have no role so will not be able to access the dashboards and form builder sections. To make yourself an Admin, run the rails console using `rails c` in project direcroty and type the following:

```ruby
$ user = User.find(1)

    => #<User id: 1, name: "YOUR_NAME", created_at: "YOUR_CREATE_DATE", updated_at: "YOUR_UPDATED_DATE", email: "YOUR_EMAIL">

$ user.add_role 'admin'

    => #<UsersRole user_id: 1, role_id: 1>
```

# Form Builder

The Form Builder is where EGRA begins. From designing forms to providing configuration details for Myna Mobile, the Form Builder is the primary store of an EGRA's business logic.

## Cohorts

Cohorts represent discrete data collection instances. A cohort's data is stored in its own Couch database, as specified during its creation. Data between cohorts do not mix. For example, data from a cohort called "Baseline" will always be kept separately from "Midline" data. A cohort must have a Language. You can name the language however you like-- the primary function of the language is its direction attribute (LTR or RTL), which helps the Myna Mobile app render the forms correctly. From within a Cohort, you can create Surveys, Survey Families, and Choice Lists. Other important features of Cohorts are described below:

### Form Type-Aheads

Form Type-Aheads provide an auto-complete function in the Myna Mobile app. When present, enumerators can pick a school code from a descriptive list of schools as opposed to double-entry. For longitudinal EGRAs, enumerators can pick from a list of pupils with pre-populated Unique Codes rather than unique codes generating on-the-fly. Input for the Schools type-ahead is a .CSV file with three columns: school_id, school_name, location_description. Input for the Pupils type-ahead is a .CSV with four columns: school_code, student_unique_code, name, family_name. Note that Schools takes school_id while Pupils takes school_code. Contact an administrator to remove type-ahead lists from the app.

### Database Configuration

Database Configuration displays information about a cohort's unique database. It includes the domain of the database's Couch instance, username and password for connecting, and the database prefix. Each cohort has two databases-- one for form schemas and the other for responses-- which are named as [database prefix]_schemas and [database prefix]_responses, respectively. **DO NOT EDIT THIS INFORMATION** Doing so could cause data loss. Instances of Myna Mobile could lose access to the databases they read forms from and write data to.

### Connection Key

Connection Key is the value used by an instance of Myna Mobile to read surveys from and write responses to a cohort's unique set of databases. The Connection Key pulls a cohort's Database Configuration into the mobile app so it can render the correct set of forms and write responses to the appropriate database location.

## Surveys

Surveys represent individual data collection forms. Surveys can be administered individually, or as a part of a Survey Family. A Survey can be assigned to one or more grades. Surveys are filtered by grade in Myna Mobile. Alternatively, a Survey can have no grade, in which case Myna Mobile will show a 'No Grade' option. A Survey can also be assigned up to six Gold Standards, each representing a unique training instances for a form. A Survey must have a name and a language to be considered valid. Surveys have four associated methods:

### Publish Schema

Once populated with Subtasks and Questions, the Publish Schema method compiles the Survey's contents into a JSON schema and save's it to the cohort's schema database. Each time a Survey is published, its version number is incremented (a survey's version number is also recorded in responses, for data reconciliation purposes). Publishing may take some time, depending on the length of the Survey and Internet connection.

### Copy Schema

The Copy Schema method exposes the JSON schema of a Survey at its latest published version.

### Upload Schema

The Upload Schema method provides a way to copy Surveys, within and between cohorts and even between instances of Myna Web. If a valid form schema is input (i.e. from the Copy Schema method), Upload Schema will replace a Survey's contents with the Subtasks and Questions as specified in the JSON schema. This operation may take some time depending on the size of the input JSON schema.

### Add/Remove from Tablet

The Add/Remove from Tablet method toggles the visibility of the survey on instances of Myna Mobile. If the button is green, the Survey is not visible to Myna Mobile users; if red, the Survey is visible and administrable.

## Subtasks

Subtasks represent individual pages or sections of a survey. All Contents of a Subtask are displayed in a single view in Myna Mobile. Subtasks have several configuration settings:

* Subtask Code - represents how data values are written in data output. A subtask code must be unique within a given survey, and can contain only letters, numbers, dash and underscore (no spaces or other special characters are permitted).
* Subtask Title - a descriptive title for the Subtask.
* Allow Skip? - if Yes, enables users in Myna Mobile to continue in a Survey without completing the Subtask.
* Publish? - if No, the Subtask is not included in the published JSON schema. Useful during form development.
* Subtask Help - a useful place to include instructions for a Subtask, which are accessible from Myna Mobile.
* AutoStop - an AutoStop value should only be set for Subtasks that should end automatically if a number of consecutive questions are answered incorrectly. Set Subtask AutoStop to the number of incorrect questions that should terminate the Subtask. Leave Subtask AutoStop blank or set to -1 if this logic does not apply.

To add a new Subtask to the end of a survey, click the blue plus-sign circle on the right side of the Survey screen. Alternatively, dragging the blue circle between existing Subtasks will insert a new Subtask. Subtasks can be re-ordered by hovering over the left edge of a subtask, and dragging and dropping in the desired order.

## Subtask Contents

Subtask Contents include read-only prompts, generic and EGRA-specific question types like the Grid. Descriptions of each content type are below:

### Read-only Text

Used for inserting prompts or instructions into Subtasks without adding a question.

### Single/Multiple Choice

Users may choose one or multiple answer choices, respectively. Answer choices are either defined in the Question form or derived from a Choice List. Single Choice questions can be displayed in Myna Mobile Radio Buttons (vertical list), Inline Buttons (horizontal list), a Dropdown. Multiple Choice question are displayed in a vertical list only.

### Confirm

Users can check a single box, valid if unchecked.

### Short/Long Text

Users can enter free text. Short Text renders a single line input box, while Long Text renders a larger text input box.

### Number

Users can enter a number. Minimum and maximum values are required, and inputs are valid inclusive of this range.

### Consent

Consent questions are like Confirm questions, with a catch. If a Consent question is left unchecked in a Myna Mobile survey, the present survey will be terminated. Logically, if Consent is not granted by the subject, the survey should not continue.

### Grid

Grids are unique to EGRA. Grids are displayed in Myna Mobile in a tabular format, where items are marked for one reason or another (often that an item was misread, marked incorrect). Grids are usually timed and include a trigger to automatically end the task if a consecutive number of items are marked. Grids have several unique attributes:

* Item Name - unique identifier that allows for configuration of Visibility Conditions using Grid variables.
* Grid Contents - can be entered three ways: 1) using the inline builder; 2) editing cells as 'double-dash-delimited' text (ex. cell 1--cell 2--cell 3...); 3) uploading a CSV. A best practice for non-Latin scripts (Arabic, etc.) is to upload a CSV then edit inline using the Grid Builder.
* Timer - duration Grid task should last in seconds.
* Grid AutoStop - number of consecutive items marked that should end a Grid task.
* Items per Row - sets the number of items per Grid row when displayed in Myna Mobile.

### Timer

Users can add timers to surveys. The timer value is set in seconds. Timers are useful when a subtask includes a timed reading separate from the questionnaire. The elapsed time is not recorded in the response.

All questions have a Visibility Condition attribute, as described in the following section. To add new Content to the end of a subtask, click the blue plus-sign circle on the right side of the subtask screen. Alternatively, dragging the blue circle between existing Contents will insert a new Question/Content. Subtask Contents can be re-ordered by hovering over the left edge of a Question/Content, and dragging and dropping in the desired order. The numbering of contents will update automatically, which should be considered when applying Visibility Conditions.

## Visibility Conditions

Visibility Conditions are used to determine whether a question/content should be visible in a form at a given time by accessing responses and evaluation validations in real time. A Visibility Condition must be a valid JavaScript operation within the scope of Myna Mobile's form administration program. Use the `$` operator and *Question Code* values to access form values. For instance, if this question/prompt is to show only when question `subtask1_x` is marked correct (i.e. value is '1'), its Visibility Condition can be set to either of the following: `$subtask1_x === '1'` or `$subtask1_x !== '2' && $subtask1_x !== '-8'`. Multiple Choice questions differ slightly as their data types is Array and not String. If `subtask1_x` is a multiple choice question, the same behavior could be replicated as follows: `$subtask1_x.length === 1 && $subtask_x.indexOf('1') > -1`.

Grids have more options for visibility conditions. Variables such as position of last item read and presence of AutoStop (among others) are available using the following operators:

* `timeRemaining` (type Integer) - how much time is left?
* `lastRead` (type Integer) - how many items were attempted?
* `autostopped` (type Boolean) - was the autostop triggered?
* `manualstopped` (type Boolean) - was the grid stopped manually?
* `attempted` (type Boolean) - has the grid been completed?
* `incorrect` (type Array) - indexes (1-based strings) for items marked as incorrect

To access these variables for a grid, use its Item Name value. For instance, if a question/content is to show only when grid `subtask1_grid_1` has fewer than 5 words read and is not autostopped, its visibility condition can be set as `$subtask1_grid_1.lastRead < 5 && !$subtask1_grid_1.autostopped`.

Visibility conditions can be very simple or highly complex, but remember they are only scoped to its parent subtask.

## Survey Families

Survey Families represent groups of survey instruments that are completed in succession. Survey Families allow for surveys to be stitched together, which reduces the amount of input required for instruments with repetitive tasks. For instance, if all of my survey instruments have the same Basic Information and Consent prompts but different subtasks to follow, the Basic Information and Consent subtasks could exist as its own survey and connect to the different sets of subtasks (via surveys) as a Survey Family. Each survey that comprises a Survey Family can be displayed in a Static or Random order. Static surveys will always be in their set position, while Random surveys with exchange places with other Random surveys. Survey Families share the same Gold Standard and Add/Remove from Tablet (Activate/Deactivate) features as present in Surveys.

## Choice Lists

Choice Lists provide convenience when creating forms with many Single or Multiple-Choice questions. Choice Options that are used repetitively (i.e. yes / no / no answer) can be selected from a list, as opposed to manually entering the labels and values. Choice Lists are advantageous over manual entry because you can update labels and values on forms universally.

# Dashboards

Dashboards provide views into the data collected for a cohort. In the Dashboards section, users have access to training and monitoring dashboards, and data management tools such as inline record editing and downloads.

## Data Downloads

Data downloads provide access to views of data. Check the boxes for the forms and view layers to include. Default data views are provided (training, operational, etc.) and custom views can be created in the Form Management section of Myna Web. The output of the data download is a zipfile containing CSV files of records returned by the selected views for each form. The zipfile also contains "Dictionary" CSV files for each form. The dictionaries include information about how to interpret data from a form. They share question codes, prompts, data types and possible values. Downloading data may take some time for larger datasets, so please be patient.

## Omit/Restore Records

During the course of form development, many responses are made that shouldn't be included in the final dataset. "Omitting" records effectively removes them from use in all dashboard functions. For instance, often times during an EGRA dry-runs are conducted in schools prior to operational data collection. Dry-runs are treated as operational, but should not be a part of the final dataset so records from these days are omitted. Omitting a record doesn't delete it, but simply adds a flag to the record so it is no longer included. **Myna Web never deletes any records** If you've omitted a record errantly, you can "restore" it using the Restore function. Both Omit and Restore Records take a comma-delimited list of response IDs as input.

## Edit Response Metadata

The main purpose of Edit Response Metadata is to mark records as Gold Standards used in the Training Dashboard. Enter a response ID to pull up the response's metadata. Check "Mark as Gold" and select the Gold Standard it should be from the list. Additionally, you can give the record an alias (i.e. "Gold 1"), which can be used instead of the response ID to pull up the record in the future. Edit Response Metadata can also be used to fix records who entered the wrong school code, enumerator ID, gold standard, etc.

## Training Dashboard

The Training Dashboard shows enumerator markings against Gold Standards. Select a survey and gold standard from the dropdowns. You can further filter to individual subtasks of a selected survey. Hover of a square to see agreement score, and click on a square to view a comparison of the record and the Gold Standard side-by-side. Enter an enumerator ID in the Search box to view all training responses by an individual.

## Monitoring Dashboard

The Monitoring Dashboard shows progress of data collection in near real-time. The upper right side shows count of surveys against targets (set in Form Management), and the number of schools visited. Clicking on a day in the calendar shows the responses collected that day displayed by enumerator and form. Daily data is available for download by clicking the Download button. Clicking on an enumerator ID or a form count will display records. Some metadata (enumerator ID, enumerator name, school code) is accessible for editing and Quality Assurance. More fields can be made editable in Form Management/Editable Fields. Clicking on a response ID will open a view of the response. Red Flags show any enumerators that meet the criteria for red flags, which are set in Form Management/Manage Views. IRR shows a view similar to the Training Dashboard, but comparing two enumerators markings of a single pupil.

# System Management

System Management provides access for Myna Web administrators to view device connections and manage forms and database views for its cohorts, and to view users and assign user roles. This section is only available to users with the Admin role.

## Manage Devices

Manage Devices simply shows a list of devices connected to a cohort belonging to an instance of Myna Web. The list includes device information such as its serial number, when it last established connection (Myna Mobile attempts to check in periodically), and to which cohort the device is connected.

## Manage Forms

Manage Forms provides methods to configure dashboards and database views for cohorts. Click on a cohort to view its surveys and survey families. Survey targets/goals, as displayed in the Monitoring Dashboard are set here. There is also a toggle to Show/Hide a survey on devices (functionally the same as Add/Remove from Tablet). Editable Fields opens a form that exposes fields that can be made editable in the Monitoring Dashboard (in addition to enumerator ID, enumerator name, and school code metadata fields).

Manage Views displays a list of CouchDB views, which are used to query data that is displayed in dashboards, included in downloads, etc. These views are map/reduce functions, with some decorators (i.e. _alias, _description, _section, _show_threshold fields) which are used for further formatting in the dashboards. Map functions must be valid JavaScript that return an emit(); Reduce should generally be _count. Monitoring and Training views should not need any modification. Custom data download options could be created by adding views to the _design/download document. Red Flags (used in the Monitoring Dashboard) can be created by adding views to the _design/red-flags document. The _description, _section, _show_threshold fields apply exclusively to red flag views:

* description - helpful text describing what a red flag is querying for
* section - if a red flag pertains to a specific subtask, enter the subtask code; clicking on a red flag record in the dashboard will return a summary of just that subtask instead of the entire response.
* show_threshold - further filters red flags to show enumerators with X or more infractions. For instance, to show enumerators with three or more tests triggering a flag, set _show_threshold to 3.

Templates are provided for inspiration.

## Manage Users

Manage Users shows a list of users and their roles. Add roles to a user by choosing from the dropdown; remove a role by clicking its red button. By default, new users are given the "User" role, which permits them to do nothing. No method is exposed for deleting users; this must be done directly in the database.

    Myna  facilitates Early Grade Reading Assessments (EGRAs). 
    EGRA’s are used by 30+ organizations in 70+ countries around the world. 
    Myna has two main components, a web application that includes a survey 
    builder and dashboard and a mobile application that facilitates offline 
    mobile data collection on tablets or smartphones. Both components offer a
    full suite of device, survey, and form management. 
    Copyright (C) 2019, Tetra Tech.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
