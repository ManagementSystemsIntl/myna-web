Rails.application.routes.draw do
  root "visitors#index"

  devise_for :users, :controllers => { registrations: 'registrations' } do
    get "/users/sign_out" => "devise/sessions#destroy", :as => :destroy_user_session
  end

  get "/app/builder/home" => "builder#index", :as => :builder
  get "/app/dashboard/home" => "dashboards#index", :as => :dashboard
  resources :users
  resources :projects
  get "select_project" => "projects#select_project", :as => :select_project
  get "/app/manage/devices" => "management#index", :as => :devices
  get "/app/manage/forms" => "management#index", :as => :forms
  get "/app/help" => "help#index", :as => :help

  scope "/api", :defaults => { :format => :json } do
    resources :choice_lists, except: [:edit, :new]
    # resources :clients, except: [:edit, :new]
    resources :connections, only: [:index, :show]
    resources :devices, only: [:index, :show]
    post "/connect/:pouch_code/device/:serial_number" => "devices#connect"
    resources :languages, except: [:edit, :new]
    resources :pouch_keys, except: [:edit, :new]
    resources :question_attributes, except: [:edit, :new]
    resources :question_categories, only: [:index, :show]
    resources :question_options, only: [:create, :index, :show]
    resources :question_types, except: [:edit, :new, :destroy]
    resources :questions, except: [:edit, :new]
    resources :schemas, except: [:edit, :new, :destroy]
    resources :sections, except: [:edit, :new]
    resources :survey_groups, except: [:edit, :new]
    resources :survey_families, except: [:edit, :new]
    put "/survey_families/:id/update_active" => "survey_families#update_active"
    post "/survey_families/:id/update_target" => "survey_families#update_target"
    resources :survey_family_joins, except: [:edit, :new]
    resources :survey_languages, except: [:edit, :new]
    resources :survey_targets, except: [:edit, :new]
    resources :surveys, except: [:edit, :new]
    post "/surveys/:id/publish_schema" => "surveys#publish_schema"
    post "/schemas/upload_schema" => "surveys#upload_schema"
    get "/surveys/:id/latest_schema" => "surveys#latest_schema"
    post "/surveys/:id/create_clone" => "surveys#create_clone"
    get "/surveys/:id/clones" => "surveys#clones"
    put "/surveys/:id/update_active" => "surveys#update_active"
    post "/surveys/:id/update_target" => "surveys#update_target"
    resources :translations, only: [:index, :show, :update]
    resources :users, only: [:index, :show]
    get "/current_user" => "users#current"
    get "/healthcheck" => "healthcheck#check_db"
  end

  get "*builder" => "builder#index"
  get "*dashboard" => "dashboards#index"
  get "*users" => "users#home"
  get "*help" => "help#index"

  

end
