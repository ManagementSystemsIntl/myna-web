class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new
    alias_action :create, :read, :update, :destroy, :to => :crud

    if user.has_role? :admin
      can :manage, :all
      can :see, :all
    end

    if user.has_role? :"form-builder-reader"
      can :see, :builder
      can :read, [ChoiceList, Language, PouchKey, QuestionAttribute, QuestionCategory, QuestionOption, QuestionType, Question, Schema, Section, SurveyGroup, Survey, SurveyFamily, Survey, Translation]
      can :read_clones, Survey
    end

    if user.has_role? :"form-builder-admin"
      can :see, :builder
      can :crud, [ChoiceList, Language, PouchKey, QuestionAttribute, QuestionCategory, QuestionOption, QuestionType, Question, Schema, Section, SurveyGroup, Survey, SurveyFamily, SurveyFamilyJoin, SurveyLanguage, Survey, Translation]
      can :clone_survey, Survey
      can :publish_schema, Survey
      can :read_clones, Survey
    end

    if user.has_role? :"dashboard-reader"
      can :see, :dashboards
      cannot :download, :dashboards
    end

    if user.has_role? :"dashboard-admin"
      can :see, :dashboards
      can :manage, :dashboards
      can :download, :dashboards
    end

    if user
      can :see, :help
    end

  end

  def as_json
    # bogus call to CanCan module to set expanded_actions
    can?(:initialize, :abilities)
    rules.map do |rule|
      {
        can: rule.base_behavior,
        actions: rule.actions.map(&:to_s), #instance_variable_get('@expanded_actions'),
        subjects: rule.subjects.map(&:to_s),
        conditions: rule.conditions.as_json
      }
    end
  end

end
