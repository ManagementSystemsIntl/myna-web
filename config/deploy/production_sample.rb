
set :stage, :production
set :app_domain, 'domain.egra.education'
server 'domain.egra.education', user: 'deployer', roles: %w{web app}, my_property: :my_value
set :branch, ENV["BRANCH_NAME"] || "master"
