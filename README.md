# MYNA-Web

## About

The Myna-web form builder is a web based application built in Ruby on Rails and AngularJS. It allows users to design EGRA and EGMA surveys that can be administered using the Myna-mobile application running on Android / iOS devices.

## Requirements

To run the form builder the following requirements need to be met by the server:

* Ruby 2.3.3+
* Rails 4.2.4
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
* FORM_BUILDER_DATABASE_USERNAME (should be set to a postgres superuser with login privileges)
* FORM_BUILDER_DATABASE_PASSWORD
* COUNCH_ENCRYPTION_KEY (Must be 32 characters or longer)
* SECRET_KEY_BASE
* MYNA_CLIENT (name of client this application is for)
* MYNA_BANNER (link to a custom banner that you would like to use)

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
