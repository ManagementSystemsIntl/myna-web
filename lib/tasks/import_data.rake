require 'pg'
require 'pry'

namespace :import_data do
  src_dbhost_key = "#{ENV['datasource']}_HOST"
  src_dbname_key = "#{ENV['datasource']}_DBNAME"
  src_dbuname_key = "#{ENV['datasource']}_DBUSERNAME"
  src_dbpw_key = "#{ENV['datasource']}_DBPASSWORD"

  desc "all"
  task all: :environment do
    puts "============================================================================================"
    puts "========================== IMPORTING ALL #{ENV['datasource']} DATA =========================="
    puts "============================================================================================"

    # order matters, especially for initial run! order here reflects order given in descriptions below.
    all_tasks = [:users, :roles, :users_roles, :projects, :projects_users,
      :survey_groups, :surveys, :survey_families, :survey_family_joins,
      :survey_targets, :languages, :survey_languages, :pouch_keys, :schemas,
      :choice_lists, :devices, :connections, :sections,
      :question_categories, :question_types, :question_options,
      :question_type_options, :questions, :question_attributes,
      :translations]

    all_tasks.each do |t|
      Rake::Task["import_data:#{t}"].execute
    end
    puts "=============================================================================================="
    puts "======================== COMPLETED IMPORT OF #{ENV['datasource']} DATA ========================"
    puts "=============================================================================================="
  end

  desc "1. Users"
  task users: :environment do
    puts "========================== IMPORTING USERS...=========================="

    users = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key], 
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT u.name
        , u.created_at
        , u.updated_at
        , u.email
        , u.encrypted_password
        , u.reset_password_token
        , u.reset_password_sent_at
        , u.remember_created_at
        , u.sign_in_count
        , u.current_sign_in_at
        , u.last_sign_in_at
        , u.current_sign_in_ip
        , u.last_sign_in_ip
        , u.confirmation_token
        , u.confirmed_at
        , u.confirmation_sent_at
        , u.unconfirmed_email
        FROM users u"
      
      rs.each do |row|
        puts "%s" % [ row['email']]
        user = {}
        user['name']= row['name']
        user['created_at'] = row['created_at']
        user['updated_at'] = row['updated_at']
        user['email'] = row['email']
        user['encrypted_password'] = row['encrypted_password']
        user['reset_password_token'] = row['reset_password_token']
        user['reset_password_sent_at'] = row['reset_password_sent_at']
        user['remember_created_at'] = row['remember_created_at'] ? row['remember_created_at'] : ''
        user['sign_in_count'] = row['sign_in_count']
        user['current_sign_in_at'] = row['current_sign_in_at'] ? row['current_sign_in_at'] : ''
        user['last_sign_in_at'] = row['last_sign_in_at'] ? row['last_sign_in_at'] : ''
        user['current_sign_in_ip'] = row['current_sign_in_ip'] ? row['current_sign_in_ip'] : ''
        user['last_sign_in_ip'] = row['last_sign_in_ip'] ? row['last_sign_in_ip'] : ''
        user['confirmation_token'] = row['confirmation_token'] ? row['confirmation_token'] : ''
        user['confirmed_at'] = row['confirmed_at'] ? row['confirmed_at'] : ''
        user['confirmation_sent_at'] = row['confirmation_sent_at'] ? row['confirmation_sent_at'] : ''
        user['unconfirmed_email'] = row['unconfirmed_email']
        users.push user
      end
    rescue PG::Error => e
      puts e.message  
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      users.each do |u|
        next if u["email"] == 'djd123@pm.me' # dj said to delete this account
        query = "INSERT INTO users (name, created_at, updated_at, email, encrypted_password, reset_password_token, reset_password_sent_at, remember_created_at, sign_in_count, current_sign_in_at, last_sign_in_at, current_sign_in_ip, last_sign_in_ip, confirmation_token, confirmed_at, confirmation_sent_at, unconfirmed_email)
        VALUES (
        '#{u["name"]}'
        , '#{u["created_at"]}'
        , '#{u["updated_at"]}'
        , '#{u["email"]}'
        , '#{u["encrypted_password"]}'
        , NULLIF('#{u["reset_password_token"]}','')
        , NULLIF('#{u["reset_password_sent_at"]}','')::timestamp
        , NULLIF('#{u["remember_created_at"]}','')::timestamp
        , #{u["sign_in_count"]}
        , NULLIF('#{u["current_sign_in_at"]}','')::timestamp
        , NULLIF('#{u["last_sign_in_at"]}','')::timestamp
        , NULLIF('#{u["current_sign_in_ip"]}','')::inet
        , NULLIF('#{u["last_sign_in_ip"]}','')::inet
        , NULLIF('#{u["confirmation_token"]}','')
        , NULLIF('#{u["confirmed_at"]}','')::timestamp
        , NULLIF('#{u["confirmation_sent_at"]}','')::timestamp
        , '#{u["unconfirmed_email"]}'
        )
        ON CONFLICT (email) DO NOTHING"
        rs = con.exec query
        puts rs # this should probably be more informative but not sure what to print
      end
    rescue PG::Error => e
      puts e.message  
    ensure
      con.close if con
    end
  end

  desc "2. Roles"
  task roles: :environment do
    puts "========================== IMPORTING ROLES...=========================="

    roles = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT r.name
        , r.resource_id
        , r.resource_type
        , r.created_at
        , r.updated_at
        FROM roles r"

      rs.each do |row|
        puts "%s" % [ row['name']]
        role = {}
        role['name'] = row['name']
        role['resource_id'] = row['resource_id'] ? row['resource_id'] : ''
        role['resource_type'] = row['resource_type'] ? row['resource_type'] : ''
        role['created_at'] = row['created_at']
        role['updated_at'] = row['updated_at']
        roles.push role
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      roles.each do |r|
        query = "INSERT INTO roles
          (name, resource_id, resource_type, created_at, updated_at)
        SELECT
          '#{r["name"]}'
          , NULLIF('#{r["resource_id"]}','')::integer
          , NULLIF('#{r["resource_type"]}','')::integer
          , '#{r["created_at"]}'
          , '#{r["updated_at"]}'
        WHERE NOT EXISTS (
          SELECT id FROM roles WHERE name = '#{r["name"]}'
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "3. User Roles"
  task users_roles: :environment do
    puts "========================== IMPORTING USERS_ROLES...=========================="

    user_roles = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT u.email, r.name
        FROM users u
        INNER JOIN users_roles ur ON u.id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id"

      rs.each do |row|
        puts "%s" % [ row['email']]
        user_role = {}
        user_role['email'] = row['email']
        user_role['role'] = row['name']
        user_roles.push user_role
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      user_roles.each do |ur|
        query = "WITH
          u AS (SELECT id FROM users WHERE email = '#{ur["email"]}'),
          r AS (SELECT id FROM roles WHERE name = '#{ur["role"]}')
        INSERT INTO users_roles (user_id, role_id)
        SELECT u.id, r.id FROM u, r
        WHERE NOT EXISTS (
          SELECT * FROM users_roles ur WHERE user_id = u.id AND role_id = r.id
        )" # could the same user have different roles in different systems?
        # is it enough to make sure there are no duplicates this way - a user can have more than one role?
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "4. Projects"
  task projects: :environment do
    puts "=========== ENTERING CURRENT PROJECT ==========="
    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      rs = con.exec "INSERT INTO projects (name, created_at, updated_at)
      SELECT '#{ENV["datasource"]}', '#{Time.now}', '#{Time.now}'
      WHERE NOT EXISTS (
        SELECT id FROM projects
        WHERE name = '#{ENV["datasource"]}'
      ) RETURNING id"
      if rs.count > 1
        puts "new project id: #{rs.getvalue(0,0)}"
        project_id = rs.getvalue(0,0) #would be useful if projects and projects_users tasks combined into one
      end

      rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "5. Project Users"
  task projects_users: :environment do
    puts "=========== ENTERING PROJECTS_USERS ==========="
    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      u_rs = con.exec "SELECT id FROM users"
      u_rs.each do |row|
        rs = con.exec "
        INSERT INTO projects_users (user_id, project_id)
        SELECT #{row["id"]}
        , (SELECT id FROM projects WHERE name = '#{ENV["datasource"]}')
        WHERE NOT EXISTS (
          SELECT * FROM projects_users
          WHERE user_id = #{row["id"]}
          AND project_id = (
            SELECT id FROM projects
            WHERE name = '#{ENV["datasource"]}'
          )
        )"
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "6. Survey Groups"
  task survey_groups: :environment do
    puts "========================== IMPORTING SURVEY_GROUPS...=========================="

    survey_groups = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]
      # school_count field exists in schema but not in morocco prod db - be sure to check for this field in other dbs;
      # eliminate if not present anywhere
      rs = con.exec "
        SELECT sg.name
        , sg.created_at
        , sg.updated_at
        , sg.encrypted_couch_pwd
        , sg.encrypted_couch_pwd_iv
        , sg.couch_domain
        , sg.couch_user
        FROM survey_groups sg"

      rs.each do |row|
        puts "%s" % [ row['name']]
        survey_group = {}
        survey_group['name'] = row['name']
        survey_group['created_at'] = row['created_at']
        survey_group['updated_at'] = row['updated_at']
        survey_group['encrypted_couch_pwd'] = row['encrypted_couch_pwd']
        survey_group['encrypted_couch_pwd_iv'] = row['encrypted_couch_pwd_iv']
        survey_group['couch_domain'] = row['couch_domain']
        survey_group['couch_user'] = row['couch_user']
        # survey_group['school_count'] = row['school_count']
        survey_groups.push survey_group
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      survey_groups.each do |sg|
        query = "INSERT INTO survey_groups (name, created_at, updated_at, encrypted_couch_pwd, encrypted_couch_pwd_iv, couch_domain, couch_user, project_id)
          SELECT
          '#{sg['name']}'
          , '#{sg['created_at']}'
          , '#{sg['updated_at']}'
          , '#{sg['encrypted_couch_pwd']}'
          , '#{sg['encrypted_couch_pwd_iv']}'
          , '#{sg['couch_domain']}'
          , '#{sg['couch_user']}'
          , (SELECT id FROM projects WHERE name = '#{ENV['datasource']}')
        WHERE NOT EXISTS (
          SELECT * FROM survey_groups WHERE name = '#{sg['name']}'
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "7. Surveys"
  task surveys: :environment do
    puts "========================== IMPORTING SURVEYS...=========================="

    surveys = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      columns_rs = con.exec "SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'surveys'"

      column_names = []
      columns_rs.each do |r|
        column_names.push r["column_name"]
      end

      retrieval_query = "
      SET standard_conforming_strings = on;
      SELECT s.survey_type
      , s.name
      , s.grade
      , sg.name as survey_group_name
      , s.created_at
      , s.updated_at
      , s.uuid
      , s.is_clone
      , s.version
      , s.version_number
      , s.version_of
      , s.cloned_from
      , s.missing_translations
      , s.is_active
      , s.gold_standards
      , #{column_names.include?('show_responses') ? 's.show_responses' : 'NULL'} AS show_responses
      FROM surveys s
      INNER JOIN survey_groups sg
      ON s.survey_group_id = sg.id"

      rs = con.exec retrieval_query

      rs.each do |row|
        puts "%s" % [ row['name']]
        survey = {}
        survey['survey_type'] = row['survey_type'] # not fk or enum
        survey['name'] = row['name']
        if survey['name'].split('').include? '\''
          esc_name = survey['name'].split('')
          esc_name.insert(esc_name.find_index('\''), '\\')
          survey['name'] = esc_name.join('')
        end
        survey['grade'] = row['grade']
        survey['survey_group_name'] = row['survey_group_name'] # is name enough for look up? for MOR, looks like it, but need to check the others. also, not every id has a corresponding entry in survey groups..
        survey['created_at'] = row['created_at']
        survey['updated_at'] = row['updated_at']
        survey['uuid'] = row['uuid']
        survey['is_clone'] = row['is_clone']
        survey['version'] = row['version'] # all FALSE, no lookups
        survey['version_number'] = row['version_number'] # all NULL in MOR
        survey['version_of'] = row['version_of'] # all NULL in MOR
        survey['cloned_from'] = row['cloned_from'] # all NULL in MOR
        survey['missing_translations'] = row['missing_translations']
        survey['is_active'] = row['is_active']
        survey['gold_standards'] = row['gold_standards'] # dj: if it's limited to #s 1-6, they can be copied over as-is
        survey['show_responses'] = row['show_responses'] # does not exist in MOR
        surveys.push survey
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      surveys.each do |s|
        query = "
        SET standard_conforming_strings = on;
        INSERT INTO surveys (survey_type, name, grade, survey_group_id, created_at, updated_at, uuid, is_clone, version, version_number, version_of, cloned_from, missing_translations, is_active, gold_standards, show_responses)
        SELECT
          '#{s["survey_type"]}'
          , E'#{s["name"]}'
          , '#{s["grade"]}'
          , (SELECT id FROM survey_groups WHERE name = '#{s["survey_group_name"]}')
          , '#{s["created_at"]}'
          , '#{s["updated_at"]}'
          , '#{s["uuid"]}'
          , '#{s["is_clone"] || 'f'}'
          , '#{s["version"] || 'f'}'
          , #{s["version_number"] || 'NULL'}
          , #{s["version_of"] || 'NULL'}
          , '#{s["cloned_from"]}'
          , #{s["missing_translations"] || 'NULL'}
          , '#{s["is_active"] || 'f'}'
          , '#{s["gold_standards"]}'
          , '#{s["show_responses"] || 'f'}'
        WHERE NOT EXISTS (
          SELECT id FROM surveys WHERE name = E'#{s["name"]}' AND uuid = '#{s["uuid"]}'
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "8. Survey Families"
  task survey_families: :environment do
    puts "========================== IMPORTING SURVEY_FAMILIES...=========================="

    survey_families = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      columns_rs = con.exec "SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'surveys'"

      column_names = []
      columns_rs.each do |r|
        column_names.push r["column_name"]
      end

      retrieval_query = "
      SELECT sf.name
      , sg.name AS survey_group_name
      , sf.created_at
      , sf.updated_at
      , sf.uuid
      , sf.is_active
      , sf.gold_standards
      , #{column_names.include?('show_responses') ? 'sf.show_responses' : 'NULL'} AS show_responses
      FROM survey_families sf
      INNER JOIN survey_groups sg
      ON sf.survey_group_id = sg.id"

      rs = con.exec retrieval_query

      rs.each do |row|
        puts "%s" % [ row['name']]
        survey_family = {}
        survey_family['name'] = row['name']
        survey_family['survey_group_name'] = row['survey_group_name']
        survey_family['created_at'] = row['created_at']
        survey_family['updated_at'] = row['updated_at']
        survey_family['uuid'] = row['uuid']
        survey_family['is_active'] = row['is_active']
        survey_family['gold_standards'] = row['gold_standards']
        survey_family['show_responses'] = row['show_responses'] # only present in DRC
        survey_families.push survey_family
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      survey_families.each do |sf|
        query = "
        INSERT INTO survey_families (name, survey_group_id, created_at, updated_at, uuid, is_active, gold_standards, show_responses)
        SELECT
          '#{sf["name"]}'
          , (SELECT id FROM survey_groups WHERE name = '#{sf["survey_group_name"]}')
          , '#{sf["created_at"]}'
          , '#{sf["updated_at"]}'
          , '#{sf["uuid"]}'
          , '#{sf["is_active"] || 'f'}'
          , '#{sf["gold_standards"]}'
          , '#{sf["show_responses"] || 'f'}'
        WHERE NOT EXISTS (
          SELECT id FROM survey_families WHERE name = '#{sf["name"]}' AND uuid = '#{sf["uuid"]}'
        )" #COME BACK AND FIX SO It CAN RUN ON ANY DB
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "9. Survey Family Joins"
  task survey_family_joins: :environment do
    puts "========================== IMPORTING SURVEY_FAMILY_JOINS...=========================="

    family_joins = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT sf.uuid AS survey_family_uuid
        , sf.name AS survey_family_name
        , s.uuid AS survey_uuid
        , s.name AS survey_name
        , sfj.created_at
        , sfj.updated_at
        , sfj.is_random
        , sfj.order
        FROM survey_family_joins sfj
        INNER JOIN survey_families sf
        ON sfj.survey_family_id = sf.id
        INNER JOIN surveys s
        ON sfj.survey_id = s.id
        INNER JOIN survey_groups sg
        ON s.survey_group_id = sg.id
        INNER JOIN survey_groups sg2
        ON sf.survey_group_id = sg2.id"

      rs.each do |row|
        puts "%s" % [ row['survey_family_name'] + ' - ' +row['survey_name']]
        family_join = {}
        family_join['survey_family_uuid'] = row['survey_family_uuid']
        family_join['survey_uuid'] = row['survey_uuid']
        family_join['created_at'] = row['created_at']
        family_join['updated_at'] = row['updated_at']
        family_join['is_random'] = row['is_random']
        family_join['order'] = row['order']
        family_joins.push family_join
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      family_joins.each do |sfj|
        query = "INSERT INTO survey_family_joins (survey_family_id, survey_id, created_at, updated_at, is_random, \"order\")
        SELECT
          (SELECT id FROM survey_families WHERE uuid = '#{sfj["survey_family_uuid"]}')
          , (SELECT id FROM surveys WHERE uuid = '#{sfj["survey_uuid"]}')
          , '#{sfj["created_at"]}'
          , '#{sfj["updated_at"]}'
          , '#{sfj["is_random"] || 'f'}'
          , '#{sfj["order"]}'
        WHERE NOT EXISTS (
          SELECT id FROM survey_family_joins WHERE survey_family_id = (
            SELECT id FROM survey_families WHERE uuid = '#{sfj["survey_family_uuid"]}'
          ) AND survey_id = (
            SELECT id FROM surveys WHERE uuid = '#{sfj["survey_uuid"]}'
          )
        )
        AND (SELECT id FROM survey_families where uuid = '#{sfj["survey_family_uuid"]}') IS NOT NULL
        AND (SELECT id FROM surveys where uuid = '#{sfj["survey_uuid"]}') IS NOT NULL"
        # there is a better version of this query somewhere. not in my head right now though.
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "10. Survey Targets"
  task survey_targets: :environment do
    puts "========================== IMPORTING SURVEY_TARGETS...=========================="

    survey_targets = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT st1.value
        , st1.targetable_id
        , st1.targetable_type
        , st1.created_at
        , st1.updated_at
        , st1.irr_value
        FROM survey_targets st1
        INNER JOIN surveys su
        ON st1.targetable_id = su.id
        INNER JOIN survey_groups sg1
        ON su.survey_group_id = sg1.id
        WHERE st1.targetable_type = 'Survey'
        UNION
        SELECT st2.value
        , st2.targetable_id
        , st2.targetable_type
        , st2.created_at
        , st2.updated_at
        , st2.irr_value
        FROM survey_targets st2
        INNER JOIN survey_families sf
        ON st2.targetable_id = sf.id
        INNER JOIN survey_groups sg2
        ON sf.survey_group_id = sg2.id
        WHERE st2.targetable_type = 'SurveyFamily'"

      rs.each do |row|
        puts "%s" % [ row['value']] #what makes sense here
        survey_target = {}
        survey_target['value'] = row['value']
        survey_target['targetable_id'] = row['targetable_id']
        survey_target['targetable_type'] = row['targetable_type']
        survey_target['created_at'] = row['created_at']
        survey_target['updated_at'] = row['updated_at']
        survey_target['irr_value'] = row['irr_value']
        survey_target['target_type_table'] = ''
        survey_target['target_uuid'] = 'NULL'

        if survey_target["targetable_type"] == "SurveyFamily"
          survey_target["target_type_table"] = "survey_families"
          target_uuid = con.exec "SELECT uuid FROM survey_families WHERE id = '#{survey_target["targetable_id"]}'"
          survey_target['target_uuid'] = target_uuid.count > 0 ? target_uuid.getvalue(0,0) : 'NULL'
        elsif survey_target["targetable_type"] == "Survey"
          survey_target["target_type_table"] = "surveys"
          target_uuid = con.exec "SELECT uuid FROM surveys WHERE id = '#{survey_target["targetable_id"]}'"
          survey_target['target_uuid'] = target_uuid.count > 0 ? target_uuid.getvalue(0,0) : 'NULL' # what
        else
          puts "current ETL does not account for #{survey_target["targetable_type"]} targetable type."
        end
        survey_targets.push survey_target
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      survey_targets.each do |st|
        query = "INSERT INTO survey_targets (value, targetable_id, targetable_type, created_at, updated_at, irr_value)
        SELECT
          '#{st["value"]}'
          , (SELECT id FROM #{st["target_type_table"]} WHERE uuid = '#{st["target_uuid"]}')
          , '#{st["targetable_type"]}'
          , '#{st["created_at"]}'
          , '#{st["updated_at"]}'
          , #{st["irr_value"] || 'NULL'}
        WHERE NOT EXISTS (
          SELECT id FROM survey_targets
          WHERE targetable_type = '#{st["targetable_type"]}'
          AND targetable_id = (
            SELECT id FROM #{st["target_type_table"]} WHERE uuid = '#{st["target_uuid"]}'
          )
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "11. Languages"
  task languages: :environment do
    puts "========================== IMPORTING LANGUAGES...=========================="

    lgs = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT l.name
        , l.created_at
        , l.updated_at
        , l.direction
        , sg.name AS survey_group_name
        FROM languages l
        INNER JOIN survey_groups sg
        ON l.survey_group_id = sg.id"

      rs.each do |row|
        puts "%s" % [ row['name']]
        lg = {}
        lg["name"] = row['name']
        lg["created_at"] = row['created_at']
        lg["updated_at"] = row['updated_at']
        lg["direction"] = row['direction']
        lg["survey_group_name"] = row['survey_group_name']
        lgs.push lg
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      lgs.each do |l|
        query = "INSERT INTO languages (name, created_at, updated_at, direction, survey_group_id)
        SELECT
        '#{l["name"]}'
        , '#{l["created_at"]}'
        , '#{l["updated_at"]}'
        , '#{l["direction"]}'
        , (SELECT id FROM survey_groups sg WHERE sg.name = '#{l["survey_group_name"]}')
        WHERE NOT EXISTS (
          SELECT id FROM languages WHERE name = '#{l["name"]}' AND survey_group_id = (
            SELECT id FROM survey_groups WHERE name = '#{l["survey_group_name"]}'
          )
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "12. Survey Languages"
  task survey_languages: :environment do
    puts "========================== IMPORTING SURVEY_LANGUAGES...=========================="

    survey_lgs = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        s.name AS survey_name
        , s.uuid AS survey_uuid
        , l.name AS language_name
        , sg.name AS language_survey_group_name
        , sl.created_at
        , sl.updated_at
        FROM survey_languages sl
        INNER JOIN surveys s
        ON sl.survey_id = s.id
        INNER JOIN languages l
        ON sl.language_id = l.id
        INNER JOIN survey_groups sg
        ON l.survey_group_id = sg.id"

      rs.each do |row|
        puts "%s" % [ row['survey_name'] + ' - ' + row['language_name']]
        survey_lg = {}
        survey_lg['survey_uuid'] = row['survey_uuid']
        survey_lg['language_name'] = row['language_name']
        survey_lg['language_survey_group_name'] = row['language_survey_group_name']
        survey_lg['created_at'] = row['created_at']
        survey_lg['updated_at'] = row['updated_at']
        survey_lgs.push survey_lg
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      survey_lgs.each do |sl|
        query = "INSERT INTO survey_languages (survey_id, language_id, created_at, updated_at)
        SELECT
        (SELECT id FROM surveys s WHERE s.uuid = '#{sl["survey_uuid"]}')
        , (SELECT id FROM languages l
            WHERE l.name = '#{sl["language_name"]}'
            AND survey_group_id = (
              SELECT id FROM survey_groups WHERE name = '#{sl["language_survey_group_name"]}'
            )
          )
        , '#{sl["created_at"]}'
        , '#{sl["updated_at"]}'
        WHERE NOT EXISTS (
          SELECT id FROM survey_languages
          WHERE survey_id = (
            SELECT id FROM surveys
            WHERE uuid = '#{sl["survey_uuid"]}'
            AND language_id = (
              SELECT id FROM languages
              WHERE name = '#{sl["language_name"]}'
              AND survey_group_id = (
                SELECT id FROM survey_groups where name = '#{sl["language_survey_group_name"]}'
              )
            )
          )
        )
        AND (SELECT id FROM survey_groups WHERE name = '#{sl["language_survey_group_name"]}') IS NOT NULL"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "13. Pouch Keys"
  task pouch_keys: :environment do
    puts "========================== IMPORTING POUCH_KEYS...=========================="

    pouch_keys = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        sg.name AS survey_group_name
        , p.username
        , p.pwd
        , p.created_at
        , p.updated_at
        , p.db_name
        , p.external_key
        , p.db_address
        FROM pouch_keys p
        INNER JOIN survey_groups sg
        ON p.survey_group_id = sg.id"

      rs.each do |row|
        puts "%s" % [ row['username'] + ' - ' + row['db_name']]
        pouch_key = {}
        pouch_key['survey_group_name'] = row['survey_group_name']
        pouch_key['username'] = row['username']
        pouch_key['pwd'] = row['pwd']
        pouch_key['created_at'] = row['created_at']
        pouch_key['updated_at'] = row['updated_at']
        pouch_key['db_name'] = row['db_name']
        pouch_key['external_key'] = row['external_key']
        pouch_key['db_address'] = row['db_address']
        pouch_keys.push pouch_key
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      pouch_keys.each do |pk|
        query = "INSERT INTO pouch_keys (survey_group_id, username, pwd, created_at, updated_at, db_name, external_key, db_address)
        SELECT
        (SELECT id FROM survey_groups sg WHERE sg.name = '#{pk["survey_group_name"]}')
        , '#{pk["username"]}'
        , '#{pk["pwd"]}'
        , '#{pk["created_at"]}'
        , '#{pk["updated_at"]}'
        , '#{pk["db_name"]}'
        , '#{pk["external_key"]}'
        , '#{pk["db_address"]}'
        WHERE NOT EXISTS (
          SELECT id FROM pouch_keys WHERE username = '#{pk["username"]}'
          AND db_name = '#{pk["db_name"]}'
          AND survey_group_id = (
            SELECT id FROM survey_groups
            WHERE name = '#{pk["survey_group_name"]}'
          )
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "14. Schemas"
  task schemas: :environment do
    puts "========================== IMPORTING SCHEMAS...=========================="

    schemas = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
      SELECT
      s1.json_schema
      , s1.iteration
      , s1.pouch_id
      , s1.created_at
      , s1.updated_at
      , s1.publishing_id
      , s1.publishing_type
      FROM schemas s1
      INNER JOIN surveys su
      ON s1.publishing_id = su.id
      INNER JOIN survey_groups sg1
      ON su.survey_group_id = sg1.id
      WHERE s1.publishing_type = 'Survey'
      UNION
      SELECT
      s2.json_schema
      , s2.iteration
      , s2.pouch_id
      , s2.created_at
      , s2.updated_at
      , s2.publishing_id
      , s2.publishing_type
      FROM schemas s2
      INNER JOIN survey_families sf
      ON s2.publishing_id = sf.id
      INNER JOIN survey_groups sg2
      ON sf.survey_group_id = sg2.id
      WHERE s2.publishing_type = 'SurveyFamily'"

      rs.each do |row|
        puts "%s" % [ row['iteration'] + ' - ' + row['pouch_id']] # is this helpful
        schema = {}
        schema['json_schema'] = row['json_schema'].gsub("'", "\\\\'")
        schema['iteration'] = row['iteration']
        schema['pouch_id'] = row['pouch_id']
        schema['created_at'] = row['created_at']
        schema['updated_at'] = row['updated_at']
        schema['publishing_id'] = row['publishing_id']
        schema['publishing_type'] = row['publishing_type']
        schema['pub_type_table'] = '' # there isn't really a sensible default. a new table will cause an error somewhere
        schema['pub_uuid'] = 'NULL'

        # in MOR, publishing type is either survey or survey family
        if schema["publishing_type"] == "SurveyFamily"
          schema["pub_type_table"] = "survey_families"
          pub_uuid = con.exec "SELECT uuid FROM survey_families WHERE id = '#{schema["publishing_id"]}'"
          schema['pub_uuid'] = pub_uuid.count > 0 ? pub_uuid.getvalue(0,0) : 'NULL' # what should this actually be
        elsif schema["publishing_type"] == "Survey"
          schema["pub_type_table"] = "surveys"
          pub_uuid = con.exec "SELECT uuid FROM surveys WHERE id = '#{schema["publishing_id"]}'"
          schema['pub_uuid'] = pub_uuid.count > 0 ? pub_uuid.getvalue(0,0) : 'NULL' # what
        else
          puts "current ETL does not account for #{schema["publishing_type"]} publishing type."
        end
        schemas.push schema
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      schemas.each do |s|
        query = "
        SET standard_conforming_strings = on;
        INSERT INTO schemas (json_schema, iteration, pouch_id, created_at, updated_at, publishing_id, publishing_type)
        SELECT
        E'#{s["json_schema"]}'
        , '#{s["iteration"]}'
        , '#{s["pouch_id"]}'
        , '#{s["created_at"]}'
        , '#{s["updated_at"]}'
        , (SELECT id FROM #{s["pub_type_table"]} WHERE uuid = '#{s["pub_uuid"]}')
        , '#{s["publishing_type"]}'
        WHERE NOT EXISTS (
          SELECT id FROM schemas
          WHERE pouch_id = '#{s["pouch_id"]}'
          AND iteration = '#{s["iteration"]}'
          AND publishing_type = '#{s["publishing_type"]}'
          AND publishing_id = (
            SELECT id FROM #{s["pub_type_table"]} WHERE uuid = '#{s["pub_uuid"]}'
          )
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "15. Choice Lists"
  task choice_lists: :environment do
    puts "========================== IMPORTING CHOICE_LISTS...=========================="

    choice_lists = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        cl.name
        , sg1.name AS list_survey_group_name
        , cl.created_at
        , cl.updated_at
        , l.name AS language_name
        , sg2.name AS language_survey_group_name
        FROM choice_lists cl
        INNER JOIN survey_groups sg1
        ON cl.survey_group_id = sg1.id
        INNER JOIN languages l
        ON cl.language_id = l.id
        INNER JOIN survey_groups sg2
        ON l.survey_group_id = sg2.id"

      rs.each do |row|
        puts "%s" % [ row['name']]
        choice_list = {}
        choice_list['name'] = row['name'].gsub("'", "\\\\'")
        choice_list['list_survey_group_name'] = row['list_survey_group_name']
        choice_list['created_at'] = row['created_at']
        choice_list['updated_at'] = row['updated_at']
        choice_list['language_name'] = row['language_name']
        choice_list['language_survey_group_name'] = row['language_survey_group_name']
        choice_lists.push choice_list
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      choice_lists.each do |cl|
        query = "
        SET standard_conforming_strings = on;
        INSERT INTO choice_lists (name, survey_group_id, created_at, updated_at, language_id)
        SELECT
        E'#{cl["name"]}'
        , (SELECT id FROM survey_groups sg WHERE sg.name = '#{cl["list_survey_group_name"]}')
        , '#{cl["created_at"]}'
        , '#{cl["updated_at"]}'
        , (SELECT id FROM languages l
            WHERE l.name = '#{cl["language_name"]}'
            AND l.survey_group_id = (
              SELECT id FROM survey_groups sg2
              WHERE sg2.name = '#{cl["language_survey_group_name"]}'
            )
          )
        WHERE NOT EXISTS (
          SELECT id FROM choice_lists
          WHERE name = E'#{cl["name"]}'
          AND survey_group_id = (SELECT id FROM survey_groups sg WHERE sg.name = '#{cl["list_survey_group_name"]}')
          AND language_id = (SELECT id FROM languages l
            WHERE l.name = '#{cl["language_name"]}'
            AND l.survey_group_id = (
              SELECT id FROM survey_groups sg2
              WHERE sg2.name = '#{cl["language_survey_group_name"]}'
            )
          )
        )
        AND (SELECT id FROM survey_groups sg WHERE sg.name = '#{cl["list_survey_group_name"]}') IS NOT NULL
        AND (SELECT id FROM survey_groups sg WHERE sg.name = '#{cl["language_survey_group_name"]}') IS NOT NULL"
        # last two ANDs might be redundant with initial select
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "16. Devices"
  task devices: :environment do
    puts "========================== IMPORTING DEVICES...=========================="

    devices = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        d.serial_number
        , d.cordova
        , d.model
        , d.platform
        , d.uuid
        , d.version
        , d.app_version
        , sg.name AS survey_group_name
        , d.external_code
        , d.created_at
        , d.updated_at
        FROM devices d
        INNER JOIN survey_groups sg
        ON d.survey_group_id = sg.id"

      rs.each do |row|
        puts "%s" % [ row['serial_number']]
        device = {}
        device['serial_number'] = row['serial_number']
        device['cordova'] = row['cordova']
        device['model'] = row['model']
        device['platform'] = row['platform'] # enum candidate?
        device['uuid'] = row['uuid']
        device['version'] = row['version'] # think this is OS version, not linked to versions table
        device['app_version'] = row['app_version']
        device['survey_group_name'] = row['survey_group_name']
        device['external_code'] = row['external_code']
        device['created_at'] = row['created_at']
        device['updated_at'] = row['updated_at']
        devices.push device
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      devices.each do |d|
        query = "INSERT INTO devices (serial_number, cordova, model, platform, uuid, version, app_version, survey_group_id, external_code, created_at, updated_at)
        SELECT
        '#{d["serial_number"]}'
        , '#{d["cordova"]}'
        , '#{d["model"]}'
        , '#{d["platform"]}'
        , '#{d["uuid"]}'
        , '#{d["version"]}'
        , '#{d["app_version"]}'
        , (SELECT id FROM survey_groups sg WHERE sg.name = '#{d["survey_group_name"]}')
        , '#{d["external_code"]}'
        , '#{d["created_at"]}'
        , '#{d["updated_at"]}'
        WHERE NOT EXISTS (
          SELECT id FROM devices WHERE serial_number = '#{d["serial_number"]}'
        )
        AND NOT EXISTS (
          SELECT id FROM devices WHERE uuid = '#{d["uuid"]}'
        )
        AND (select id FROM survey_groups sg WHERE sg.name = '#{d["survey_group_name"]}') IS NOT NULL"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "17. Connections"
  task connections: :environment do
    puts "========================== IMPORTING CONNECTIONS...=========================="

    connections = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        d.serial_number AS device_serial_number
        , sg.name AS survey_group_name
        , c.active
        , c.created_at
        , c.updated_at
        FROM connections c
        INNER JOIN survey_groups sg
        ON c.survey_group_id = sg.id
        INNER JOIN devices d
        ON c.device_id = d.id
        INNER JOIN survey_groups sg2
        ON d.survey_group_id = sg2.id"

      rs.each do |row|
        puts "%s" % [ row['device_serial_number'] + ' - ' + row['survey_group_name']]
        connection = {}
        connection['device_serial_number'] = row['device_serial_number']
        connection['survey_group_name'] = row['survey_group_name']
        connection['active'] = row['active']
        connection['created_at'] = row['created_at']
        connection['updated_at'] = row['updated_at']
        connections.push connection
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      connections.each do |c|
        # uniqueness across multiple dbs will be hard to enforce bc no combination of columns is unique, just id..
        query = "INSERT INTO connections (device_id, survey_group_id, active, created_at, updated_at)
        SELECT
        (SELECT id FROM devices d WHERE d.serial_number = '#{c["device_serial_number"]}')
        , (SELECT id FROM survey_groups sg WHERE sg.name = '#{c["survey_group_name"]}')
        , '#{c["active"] || 'f'}'
        , '#{c["created_at"]}'
        , '#{c["updated_at"]}'
        WHERE (SELECT id FROM survey_groups sg WHERE sg.name = '#{c["survey_group_name"]}') IS NOT NULL"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "18. Sections"
  task sections: :environment do
    puts "========================== IMPORTING SECTIONS...=========================="

    sections = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        su.uuid AS survey_uuid
        , sg.name AS survey_group_name
        , se.name
        , se.code
        , se.created_at
        , se.order
        , se.timer_value
        , se.skippable
        , se.autostop
        , se.created_at
        , se.updated_at
        , se.is_publishable
        , se.grade
        , se.hint
        FROM sections se
        INNER JOIN surveys su
        ON se.survey_id = su.id
        INNER JOIN survey_groups sg
        ON su.survey_group_id = sg.id"

      rs.each do |row|
        puts "%s" % [ row['name']]
        section = {}
        section['survey_uuid'] = row['survey_uuid']
        section['survey_group_name'] = row['survey_group_name']
        section['name'] = (!row['name'].nil?) ? row['name'].gsub("'", "\\\\'") : row['name']
        section['code'] = row['code']
        section['order'] = row['order']
        section['timer_value'] = row['timer_value']
        section['skippable'] = row['skippable']
        section['autostop'] = row['autostop']
        section['created_at'] = row['created_at']
        section['updated_at'] = row['updated_at']
        section['is_publishable'] = row['is_publishable']
        section['grade'] = row['grade']
        section['hint'] = (!row['hint'].nil?) ? row['hint'].gsub("'", "\\\\'") : row['hint']
        sections.push section
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      sections.each_with_index do |se,i|
        query = "
        SET standard_conforming_strings = on;
        PREPARE query_#{i} (text, text, text, int, int, bool, int, timestamp, timestamp, bool, text, text, text) AS
        INSERT INTO sections (survey_id, name, code, \"order\", timer_value, skippable, autostop, created_at, updated_at, is_publishable, grade, hint)
        SELECT
        (SELECT id FROM surveys su WHERE su.uuid = $1)
        , $2
        , $3
        , $4
        , $5
        , $6
        , $7
        , $8
        , $9
        , $10
        , $11
        , $12
        WHERE NOT EXISTS (
          SELECT id FROM sections WHERE name = $2 AND code = $3 AND survey_id = (
            SELECT id FROM surveys WHERE uuid = $1
          )
        )
        AND (SELECT id FROM surveys su WHERE su.uuid = $1) IS NOT NULL
        AND (SELECT id FROM survey_groups sg WHERE sg.name = $13) IS NOT NULL;
        EXECUTE query_#{i}(
          '#{se["survey_uuid"]}'
          , E'#{se["name"]}'
          , '#{se["code"]}'
          , #{se["order"] || 'NULL'}
          , #{se["timer_value"] || 'NULL'}
          , '#{se["skippable"] || 'f'}'
          , #{se["autostop"] || 'NULL'}
          , '#{se["created_at"]}'
          , '#{se["updated_at"]}'
          , '#{se["is_publishable"] || 'f'}'
          , '#{se["grade"]}'
          , E'#{se["hint"]}'
          , '#{se["survey_group_name"]}'
        );"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "19. Question Categories"
  task question_categories: :environment do
    puts "========================== IMPORTING QUESTION_CATEGORIES...=========================="

    q_cats = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        qc.name
        , qc.descriptive
        , qc.created_at
        , qc.updated_at
        FROM question_categories qc"

      rs.each do |row|
        puts "%s" % [ row['name'] ]
        q_cat = {}
        q_cat['name'] = row['name']
        q_cat['descriptive'] = row['descriptive']
        q_cat['created_at'] = row['created_at']
        q_cat['updated_at'] = row['updated_at']
        q_cats.push q_cat
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      q_cats.each do |qc|
        # is name/descriptive enough to prevent dupes?
        query = "INSERT INTO question_categories (name, descriptive, created_at, updated_at)
        SELECT
        '#{qc["name"]}'
        , '#{qc["descriptive"]}'
        , '#{qc["created_at"]}'
        , '#{qc["updated_at"]}'
        WHERE NOT EXISTS (
          SELECT id FROM question_categories WHERE name = '#{qc["name"]}' AND descriptive = '#{qc["descriptive"]}'
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "20. Question Types"
  task question_types: :environment do
    puts "========================== IMPORTING QUESTION_TYPES...=========================="

    q_types = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        qt.name
        , qt.descriptive
        , qt.created_at
        , qt.updated_at
        , qt.has_number
        , qc.name AS question_category_name
        FROM question_types qt
        INNER JOIN question_categories qc
        ON qt.question_category_id = qc.id"

      rs.each do |row|
        puts "%s" % [ row['name'] ]
        q_type = {}
        q_type['name'] = row['name']
        q_type['descriptive'] = row['descriptive']
        q_type['created_at'] = row['created_at']
        q_type['updated_at'] = row['updated_at']
        q_type['has_number'] = row['has_number']
        q_type['question_category_name'] = row['question_category_name']
        q_types.push q_type
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      q_types.each do |qt|
        query = "INSERT INTO question_types (name, descriptive, created_at, updated_at, has_number, question_category_id)
        SELECT
        '#{qt["name"]}'
        , '#{qt["descriptive"]}'
        , '#{qt["created_at"]}'
        , '#{qt["updated_at"]}'
        , '#{qt["has_number"] || 'f'}'
        , (SELECT id FROM question_categories qc WHERE qc.name = '#{qt["question_category_name"]}')
        WHERE NOT EXISTS (
          SELECT id FROM question_types WHERE name = '#{qt["name"]}' AND descriptive = '#{qt["descriptive"]}' AND question_category_id = (
            SELECT id FROM question_categories qc WHERE qc.name = '#{qt["question_category_name"]}'
          )
        )
        AND (SELECT id FROM question_categories qc WHERE qc.name = '#{qt["question_category_name"]}') IS NOT NULL"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "21. Question Options"
  task question_options: :environment do
    puts "========================== IMPORTING QUESTION_OPTIONS...=========================="

    q_opts = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        qo.name
        , qo.option_type
        , qo.created_at
        , qo.updated_at
        , qo.translatable
        FROM question_options qo"

      rs.each do |row|
        puts "%s" % [ row['name'] ]
        q_opt = {}
        q_opt['name'] = row['name']
        q_opt['option_type'] = row['option_type'] #enum candidate? or somehow preset by the app? seems to be datatypes
        q_opt['created_at'] = row['created_at']
        q_opt['updated_at'] = row['updated_at']
        q_opt['translatable'] = row['translatable']
        q_opts.push q_opt
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      q_opts.each do |qo|
        query = "INSERT INTO question_options (name, option_type, created_at, updated_at, translatable)
        SELECT
        '#{qo["name"]}'
        , '#{qo["option_type"]}'
        , '#{qo["created_at"]}'
        , '#{qo["updated_at"]}'
        , '#{qo["translatable"] || 'f'}'
        WHERE NOT EXISTS (
          SELECT id FROM question_options WHERE name = '#{qo["name"]}' AND option_type = '#{qo["option_type"]}'
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "22. Question Type Options"
  task question_type_options: :environment do
    puts "========================== IMPORTING QUESTION_TYPE_OPTIONS...=========================="

    q_type_opts = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        qt.name AS question_type_name
        , qo.name AS question_option_name
        , qto.created_at
        , qto.updated_at
        FROM question_type_options qto
        INNER JOIN question_types qt
        ON qto.question_type_id = qt.id
        INNER JOIN question_options qo
        ON qto.question_option_id = qo.id"

      rs.each do |row|
        puts "%s" % [ row['question_type_name'] + ' - ' + row['question_option_name'] ]
        q_type_opt = {}
        q_type_opt['question_type_name'] = row['question_type_name']
        q_type_opt['question_option_name'] = row['question_option_name']
        q_type_opt['created_at'] = row['created_at']
        q_type_opt['updated_at'] = row['updated_at']
        q_type_opts.push q_type_opt
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      q_type_opts.each do |qto|
        query = "INSERT INTO question_type_options (question_type_id, question_option_id, created_at, updated_at)
        SELECT
        (SELECT id FROM question_types qt WHERE qt.name = '#{qto["question_type_name"]}')
        , (SELECT id FROM question_options qo WHERE qo.name = '#{qto["question_option_name"]}')
        , '#{qto["created_at"]}'
        , '#{qto["updated_at"]}'
        WHERE NOT EXISTS (
          SELECT id FROM question_type_options
          WHERE question_type_id = (SELECT id FROM question_types WHERE name = '#{qto["question_type_name"]}')
          AND question_option_id = (SELECT id FROM question_options WHERE name = '#{qto["question_option_name"]}')
        )
        AND EXISTS (SELECT id FROM question_types qt WHERE qt.name = '#{qto["question_type_name"]}')
        AND EXISTS (SELECT id FROM question_options qo WHERE qo.name = '#{qto["question_option_name"]}')"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "23. Questions"
  task questions: :environment do
    puts "========================== IMPORTING QUESTIONS...=========================="

    questions = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        q.order
        , qt.name AS question_type_name
        , se.name AS section_name
        , se.order AS section_order
        , su2.uuid AS section_survey_uuid
        , su.uuid AS survey_uuid
        , q.created_at
        , q.updated_at
        , q.question_number
        , cl.name AS choice_list_name
        , sg.name AS choice_list_survey_group_name
        FROM questions q
        INNER JOIN question_types qt
        ON q.question_type_id = qt.id
        INNER JOIN sections se
        ON q.section_id = se.id
        INNER JOIN surveys su
        ON q.survey_id = su.id
        INNER JOIN surveys su2
        ON se.survey_id = su2.id
        LEFT JOIN choice_lists cl
        ON q.choice_list_id = cl.id
        LEFT JOIN survey_groups sg
        ON cl.survey_group_id = sg.id
        INNER JOIN survey_groups sg2
        ON su.survey_group_id = sg2.id
        INNER JOIN survey_groups sg3
        ON su2.survey_group_id = sg3.id"

        # #############################################################
        # QUERY VALIDATION BECAUSE MY HEAD IS BROKEN:
        # select questions for which:
        #   question type exists in the system
        #       - INNER JOIN question_types qt ON q.question_type_id = qt.id
        #   section exists in the system
        #       - INNER JOIN sections se ON q.section_id = se.id
        #   section is associated with a survey that is in the system
        #       - INNER JOIN surveys su2 ON se.survey_id = su2.id
        #   section is associated with a survey that has a survey group that is in the system
        #       - INNER JOIN survey_groups sg3 ON su2.survey_group_id = sg3.id
        #   survey exists in the system
        #       - INNER JOIN surveys su ON q.survey_id = su.id
        #   survey is associated with a survey group that is in the system
        #       - INNER JOIN survey_groups sg2 ON su.survey_group_id = sg2.id
        #   where given, choice list is in the system
        #       - LEFT JOIN choice_lists cl ON q.choice_list_id = cl.id
        #   where given, choice list is associated with a survey group that is in the system
        #       - LEFT JOIN survey_groups sg ON cl.survey_group_id = sg.id
        #       * originally had this as an inner join but that was ruling out all the nulls
        # QUESTION: DO WE WANT TO FULLY RULE OUT QUESTIONS THAT HAVE VALID QUESTION INFO
        # BUT INVALID CHOICE LIST INFO?
        # ##############################################################

      rs.each do |row|
        puts "%s" % [ row['question_type_name']+' - '+row['section_name']+' - '+row['order'] ] #what makes sense here?
        q = {}
        q['order'] = row['order']
        q['question_type_name'] = row['question_type_name'].gsub("'", "\\\\'") # name is unique and always present in MOR
        q['section_name'] = row['section_name'].gsub("'", "\\\\'") # sections must have a name
        q['section_survey_uuid'] = row['section_survey_uuid']
        q['section_order'] = row['section_order']
        q['survey_uuid'] = row['survey_uuid']
        q['created_at'] = row['created_at']
        q['updated_at'] = row['updated_at']
        q['question_number'] = row['question_number']
        q['choice_list_name'] = (!row['choice_list_name'].nil?) ? row['choice_list_name'].gsub("'", "\\\\'") : row['choice_list_name']# this plus next give unique choice list row
        q['choice_list_survey_group_name'] = row['choice_list_survey_group_name']
        questions.push q
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      questions.each do |q|
        query = "
        SET standard_conforming_strings = on;
        INSERT INTO questions (\"order\", question_type_id, section_id, survey_id, created_at, updated_at, question_number, choice_list_id)
        SELECT
        #{q["order"]}
        , (SELECT id FROM question_types qt WHERE qt.name = E'#{q["question_type_name"]}')
        , (SELECT id FROM sections se
            WHERE se.name = E'#{q["section_name"]}'
            AND se.order = #{q["section_order"]}
            AND se.survey_id = (
              SELECT id FROM surveys
              WHERE uuid = '#{q["section_survey_uuid"]}'
            )
          )
        , (SELECT id FROM surveys su WHERE su.uuid = '#{q["survey_uuid"]}')
        , '#{q["created_at"]}'
        , '#{q["updated_at"]}'
        , #{q["question_number"] || 'NULL'}
        , (SELECT id FROM choice_lists cl
            WHERE cl.name = E'#{q["choice_list_name"]}'
            AND cl.survey_group_id = (
              SELECT id FROM survey_groups
              WHERE name = '#{q["choice_list_survey_group_name"]}'
            )
          )
        WHERE NOT EXISTS (
          SELECT id FROM questions
          WHERE survey_id = (SELECT id FROM surveys WHERE uuid = '#{q["survey_uuid"]}')
          AND section_id = (
            SELECT id FROM sections se
            WHERE se.name = E'#{q["section_name"]}'
            AND se.order = #{q["section_order"]}
            AND se.survey_id = (
              SELECT id FROM surveys su
              WHERE su.uuid = '#{q["section_survey_uuid"]}'
            )
          )
          AND \"order\" = #{q["order"]}
          AND question_number #{ q["question_number"].nil? ? 'IS NULL' : '='+q["question_number"] }
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "24. Question Attributes"
  task question_attributes: :environment do
    puts "========================== IMPORTING QUESTION_ATTRIBUTES...=========================="

    q_atts = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
        SELECT
        qo.name AS question_option_name
        , qa.name
        , qa.value
        , q.order AS question_order
        , se.name AS question_section_name
        , se.order AS question_section_order
        , su2.uuid AS question_section_survey_uuid
        , su.uuid AS question_survey_uuid
        , q.question_number AS question_number
        , qa.created_at
        , qa.updated_at
        , qa.coded_value
        , qa.order
        , NULL AS choice_list_name
        , NULL AS choice_list_survey_group_name
        FROM question_attributes qa
        INNER JOIN question_options qo
        ON qa.question_option_id = qo.id
        INNER JOIN questions q
        ON qa.question_id = q.id
        INNER JOIN sections se
        ON q.section_id = se.id
        INNER JOIN surveys su
        ON q.survey_id = su.id
        INNER JOIN survey_groups sg1
        ON su.survey_group_id = sg1.id
        INNER JOIN surveys su2
        ON se.survey_id = su2.id
        INNER JOIN survey_groups sg2
        ON su2.survey_group_id = sg2.id
        UNION
        SELECT
        qo2.name AS question_option_name
        , qa2.name
        , qa2.value
        , NULL AS question_order
        , NULL AS question_section_name
        , NULL AS question_section_order
        , NULL AS question_section_survey_uuid
        , NULL AS question_survey_uuid
        , NULL AS question_number
        , qa2.created_at
        , qa2.updated_at
        , qa2.coded_value
        , qa2.order
        , cl.name choice_list_name
        , sg.name choice_list_survey_group_name
        FROM question_attributes qa2
        INNER JOIN question_options qo2
        ON qa2.question_option_id = qo2.id
        INNER JOIN questions q
        ON qa2.question_id = q.id
        INNER JOIN choice_lists cl
        ON qa2.choice_list_id = cl.id
        INNER JOIN survey_groups sg
        ON cl.survey_group_id = sg.id"

      rs.each do |row|
        # puts "%s" % [ row['name'] ] # is there anything useful to print here?
        q_att = {}
        q_att['question_option_name'] = row['question_option_name'] # name is unique
        q_att['name'] = row['name']
        q_att['value'] = (!row['value'].nil?) ? row['value'].gsub("'", "\\\\'") : row['value']
        q_att['question_order'] = row['question_order']
        q_att['question_section_name'] = (!row['question_section_name'].nil?) ? row['question_section_name'].gsub("'", "\\\\'") : row['question_section_name']
        q_att['question_section_order'] = row['question_section_order']
        q_att['question_section_survey_uuid'] = row['question_section_survey_uuid']
        q_att['question_survey_uuid'] = row['question_survey_uuid']
        q_att['question_number'] = row['question_number']
        q_att['created_at'] = row['created_at']
        q_att['updated_at'] = row['updated_at']
        q_att['coded_value'] = row['coded_value']
        q_att['order'] = row['order']
        q_att['choice_list_name'] = (!row['choice_list_name'].nil?) ? row['choice_list_name'].gsub("'", "\\\\'") : row['choice_list_name']
        q_att['choice_list_survey_group_name'] = row['choice_list_survey_group_name']
        q_atts.push q_att
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      q_atts.each do |qa|
        query = "
        SET standard_conforming_strings = on;
        INSERT INTO question_attributes (question_option_id, name, value, question_id, created_at, updated_at, coded_value, \"order\", choice_list_id)
        SELECT
        (SELECT id FROM question_options qo WHERE qo.name = '#{qa["question_option_name"]}')
        , '#{qa["name"]}'
        , E'#{qa["value"]}'
        , (
            SELECT id FROM questions q
            WHERE q.order = #{qa["question_order"] || 'NULL'}
            AND q.section_id = (
              SELECT id FROM sections se
              WHERE se.name = E'#{qa["question_section_name"]}'
              AND se.order = #{qa["question_section_order"] || 'NULL'}
              AND se.survey_id = (
                SELECT id FROM surveys
                WHERE uuid = '#{qa["question_section_survey_uuid"]}'
              )
            )
            AND q.survey_id = (SELECT id FROM surveys su WHERE su.uuid = '#{qa["question_survey_uuid"]}')
          )
        , '#{qa["created_at"]}'
        , '#{qa["updated_at"]}'
        , '#{qa["coded_value"]}'
        , #{qa["order"] || 'NULL'}
        , (
            SELECT id FROM choice_lists cl
            WHERE cl.name = E'#{qa["choice_list_name"]}'
            AND cl.survey_group_id = (
              SELECT id FROM survey_groups sg
              WHERE sg.name = '#{qa["choice_list_survey_group_name"]}'
            )
          )
        WHERE NOT EXISTS (
          SELECT id FROM question_attributes
          WHERE question_option_id = (
            SELECT id FROM question_options qo
            WHERE qo.name = '#{qa["question_option_name"]}'
          )
          AND name = '#{qa["name"]}'
          AND value = E'#{qa["value"]}'
          AND question_id = (
            SELECT id FROM questions q
            WHERE q.order = #{qa["question_order"] || 'NULL'}
            AND q.section_id = (
              SELECT id FROM sections se
              WHERE se.name = E'#{qa["question_section_name"]}'
              AND se.order = #{qa["question_section_order"] || 'NULL'}
              AND se.survey_id = (
                SELECT id FROM surveys
                WHERE uuid = '#{qa["question_section_survey_uuid"]}'
              )
            )
            AND q.survey_id = (SELECT id FROM surveys su WHERE su.uuid = '#{qa["question_survey_uuid"]}')
          )
        ) AND NOT EXISTS (
          SELECT id FROM question_attributes
          WHERE question_option_id = (
            SELECT id FROM question_options qo
            WHERE qo.name = '#{qa["question_option_name"]}'
          )
          AND name = '#{qa["name"]}'
          AND value = E'#{qa["value"]}'
          AND choice_list_id = (
            SELECT id FROM choice_lists cl
            WHERE cl.name = E'#{qa["choice_list_name"]}'
            AND cl.survey_group_id = (
              SELECT id FROM survey_groups sg
              WHERE sg.name = '#{qa["choice_list_survey_group_name"]}'
            )
          )
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "25. Translations"
  task translations: :environment do
    puts "========================== IMPORTING TRANSLATIONS...=========================="

    translations = []

    begin
      con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
      :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

      rs = con.exec "
      SELECT
      l.name AS lang_name,
      sg.name as lang_sg_name,
      qa.name AS qatt_name,
      qa.value AS qatt_value,
      qo.name as q_option_name,
      t.value AS t_value,
      t.created_at,
      t.updated_at,
      q.order as q_order,
      q.question_number as q_number,
      qt.name as q_type_name,
      s.uuid as q_survey_uuid,
      se.name as section_name,
      se.order as section_order,
      s2.uuid as section_survey_uuid
      FROM translations t
      INNER JOIN languages l
      on t.language_id = l.id
      inner join survey_groups sg
      on l.survey_group_id = sg.id
      INNER JOIN question_attributes qa
      ON t.question_attribute_id = qa.id
      inner join question_options qo
      on qa.question_option_id = qo.id
      inner join questions q
      on qa.question_id = q.id
      inner join question_types qt
      on q.question_type_id = qt.id
      inner join surveys s
      on q.survey_id = s.id
      inner join sections se
      on q.section_id = se.id
      inner join surveys s2
      on se.survey_id = s2.id
      inner join survey_groups sg2
      on s2.survey_group_id = sg2.id"

      rs.each do |row|
        puts "%s" % [ row['lang_name'] + ' - ' + row['qatt_name'] + ' - ' + row['qatt_value']]
        tran = {}
        tran['lang_name'] = row['lang_name']
        tran['lang_sg_name'] = row['lang_sg_name']
        tran['qatt_name'] = (!row['qatt_name'].nil?) ? row['qatt_name'].gsub("'", "\\\\'") : row['qatt_name']
        tran['qatt_value'] = (!row['qatt_value'].nil?) ? row['qatt_value'].gsub("'", "\\\\'") : row['qatt_value']
        tran['q_option_name'] = row['q_option_name']
        tran['t_value'] = row['t_value']
        tran['created_at'] = row['created_at']
        tran['updated_at'] = row['updated_at']
        tran['q_order'] = row['q_order']
        tran['q_number'] = row['q_number']
        tran['q_type_name'] = row['q_type_name']
        tran['q_survey_uuid'] = row['q_survey_uuid']
        tran['section_name'] = row['section_name'].gsub("'", "\\\\'")
        tran['section_order'] = row['section_order']
        tran['section_survey_uuid'] = row['section_survey_uuid']
        translations.push tran
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end

    begin
      con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
      :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

      translations.each do |t|
        query = "
        SET standard_conforming_strings = on;
        INSERT INTO translations (language_id, question_attribute_id, value, created_at, updated_at)
        SELECT
        (SELECT l.id FROM languages l
          WHERE l.name = '#{t["lang_name"]}'
          AND l.survey_group_id = (
            SELECT id FROM survey_groups WHERE name = '#{t["lang_sg_name"]}'
          )
        )
        , (SELECT qa.id FROM question_attributes qa
          WHERE qa.name = E'#{t["qatt_name"]}'
          AND qa.value = E'#{t["qatt_value"]}'
          AND qa.choice_list_id IS NULL
          AND qa.question_option_id = (
            SELECT id FROM question_options qo
            WHERE qo.name = '#{t["q_option_name"]}'
          )
          AND qa.question_id = (
            SELECT id FROM questions q
            WHERE q.\"order\" = #{t["q_order"]}
            AND q.question_number #{ t["q_number"].nil? ? 'IS NULL' : '='+t["q_number"] }
            AND q.question_type_id = (
              SELECT id FROM question_types qt
              WHERE qt.name = '#{t["q_type_name"]}'
            )
            AND q.survey_id = (
              SELECT id FROM surveys s
              WHERE s.uuid = '#{t["q_survey_uuid"]}'
            )
            AND q.section_id = (
              SELECT id FROM sections se
              WHERE se.name = E'#{t["section_name"]}'
              AND se.order = #{t["section_order"]}
              AND se.survey_id = (
                SELECT id FROM surveys
                WHERE uuid = '#{t["section_survey_uuid"]}'
              )
            )
          )
        )
        , '#{t["t_value"]}'
        , '#{t["created_at"]}'
        , '#{t["updated_at"]}'
        WHERE NOT EXISTS (
          SELECT id FROM translations
          WHERE language_id = (
            SELECT l.id FROM languages l
            WHERE l.name = '#{t["lang_name"]}'
            AND l.survey_group_id = (
              SELECT id FROM survey_groups WHERE name = '#{t["lang_sg_name"]}'
            )
          )
          AND question_attribute_id = (
            SELECT qa.id FROM question_attributes qa
            WHERE qa.name = E'#{t["qatt_name"]}'
            AND qa.value = E'#{t["qatt_value"]}'
            AND qa.choice_list_id IS NULL
            AND qa.question_option_id = (
              SELECT id FROM question_options qo
              WHERE qo.name = '#{t["q_option_name"]}'
            )
            AND qa.question_id = (
              SELECT id FROM questions q
              WHERE q.\"order\" = #{t["q_order"]}
              AND q.question_number #{ t["q_number"].nil? ? 'IS NULL' : '='+t["q_number"] }
              AND q.question_type_id = (
                SELECT id FROM question_types qt
                WHERE qt.name = '#{t["q_type_name"]}'
              )
              AND q.survey_id = (
                SELECT id FROM surveys s
                WHERE s.uuid = '#{t["q_survey_uuid"]}'
              )
              AND q.section_id = (
                SELECT id FROM sections se
                WHERE se.name = E'#{t["section_name"]}'
                AND se.order = #{t["section_order"]}
                AND se.survey_id = (
                  SELECT id FROM surveys
                  WHERE uuid = '#{t["section_survey_uuid"]}'
                )
              )
            )
          )
        )"
        rs = con.exec query
        puts rs
      end
    rescue PG::Error => e
      puts e.message
    ensure
      con.close if con
    end
  end

  desc "26. Versions"
  task versions: :environment do
    puts "========================== IMPORTING VERSIONS...=========================="
    # THIS ONE IS NOT COMPLETE.
    versions = []
    # begin
    #   con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
    #   :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

    #   rs = con.exec "
    #     SELECT v.item_type
    #     , v.item_id
    #     , v.event
    #     , v.whodunnit
    #     , v.object
    #     , v.created_at
    #     FROM versions v"

    #   rs.each do |row|
    #     puts "%s" % [ row['item_type']] #what is useful to print here
    #     version = {}
    #     version['item_type'] = row['item_type'] # should be enum but is varchar
    #     # convert to table name format
    #     version['item_id'] = row['item_id'] # would be a fk but is not.. need to look up based on type, ick
    #     version['event'] = row['event']
    #     version['whodunnit'] = row['whodunnit']
    #     version['object'] = row['object']
    #     version['created_at'] = row['created_at']
    #     versions.push version
    #   end
    # rescue PG::Error => e
    #   puts e.message
    # ensure
    #   con.close if con
    # end

    # another loop here (Versions) with another query within, which updates the version items with a new id.
    # will need to treat each item type differently, since available fields/uniqueness conditions will differ in each case
    # versions.each do |v|...
    #begin
    # con = PG.connect :host => ENV[src_dbhost_key], :dbname => ENV[src_dbname_key],
    # :user => ENV[src_dbuname_key], :password => ENV[src_dbpw_key]

    # rs = con.exec "
    # SELECT name,  FROM #{version["item_table"]} WHERE..."
    # begin
    #   con = PG.connect :host => ENV['REMOTE_POSTGRES_HOST'], :dbname => ENV['REMOTE_POSTGRES_DBNAME'],
    #   :user => ENV['REMOTE_POSTGRES_USER'], :password => ENV['REMOTE_POSTGRES_PASSWORD']

    #   versions.each do |v|
    #     query = "INSERT INTO versions (item_type, item_id, event, whodunnit, object, created_at)
    #     VALUES
    #     '#{v["item_type"]}'
    #     , (SELECT id FROM '#{v["item_type"]}'
    #     , '#{v["event"]}'
    #     , '#{v["whodunnit"]}'
    #     , '#{v["object"]}'
    #     , '#{v["created_at"]}'"
    #     puts query
    #     rs = con.exec query
    #     puts rs
    #   end
    # rescue PG::Error => e
    #   puts e.message
    # ensure
    #   con.close if con
    # end
  end

end
