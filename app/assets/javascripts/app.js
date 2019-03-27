//= require pouchdb/dist/pouchdb.min
//= require d3/d3
//= require moment/min/moment.min
//= require alasql/dist/alasql
//= require js-xlsx/dist/xlsx.core.min
//= require jszip/dist/jszip
//= require file-saver/FileSaver
//= require ace-builds/src-min-noconflict/ace
//= require ace-builds/src-min-noconflict/mode-javascript

//= require angular/angular.min
//= require angular-rails-templates
//= require_tree ../templates
//= require angular-ui-router/release/angular-ui-router.min
//= require angular-resource/angular-resource.min
//= require ng-rails-csrf
//= require ng-sortable/dist/ng-sortable.min
//= require angular-pouchdb/angular-pouchdb.min
//= require textAngular/dist/textAngular-rangy.min
//= require textAngular/dist/textAngular-sanitize.min
//= require textAngular/dist/textAngular.min
//= require angular-flash-alert/dist/angular-flash.min
//= require angular-csv-import/dist/angular-csv-import
//= require angular-object-diff/dist/angular-object-diff
//= require angular-moment-picker/dist/angular-moment-picker
//= require angular-ui-ace/ui-ace

//= require ./app/app.module

//= require ./app/shared/site.nav.controller
//= require ./app/shared/breadcrumb.directive
//= require ./app/shared/pouch.service
//= require ./app/shared/utils.service
//= require ./app/shared/current.user.service
//= require ./app/shared/confirm.directive
//= require ./app/shared/loading.directive
//= require ./app/shared/csv.service

//= require ./app/builder/index.controller
//= require ./app/builder/diff.directive

//= require ./app/management/management.module
//= require ./app/management/users.controller
//= require ./app/management/forms.controller
//= require ./app/management/devices.controller
//= require ./app/management/user.factory
//= require ./app/management/user.service
//= require ./app/management/role.show.directive
//= require ./app/management/role.form.directive
//= require ./app/management/editable.form.directive
//= require ./app/management/tracking.form.directive
//= require ./app/management/views.form.directive
//= require ./app/management/views.modal.directive
//= require ./app/management/role.factory
//= require ./app/management/role.service
//= require ./app/management/device.factory
//= require ./app/management/device.service

//= require ./app/dashboard/dashboard.module
//= require ./app/dashboard/index.controller
//= require ./app/dashboard/show.controller
//= require ./app/dashboard/response.compare.directive
//= require ./app/dashboard/data.service
//= require ./app/dashboard/download.service
//= require ./app/dashboard/scoring.service
//= require ./app/dashboard/monitoring/monitoring.controller
//= require ./app/dashboard/monitoring/monitoring.calendar.directive
//= require ./app/dashboard/monitoring/monitoring.irr.directive
//= require ./app/dashboard/monitoring/monitoring.modal.directive
//= require ./app/dashboard/monitoring/monitoring.progress.directive
//= require ./app/dashboard/monitoring/monitoring.redflags.directive
//= require ./app/dashboard/monitoring/monitoring.table.directive
//= require ./app/dashboard/monitoring/monitoring.tooltip.directive
//= require ./app/dashboard/training/training.controller
//= require ./app/dashboard/training/training.chart.directive
//= require ./app/dashboard/training/training.cluster.directive

//= require ./app/survey_groups/survey.group.module
//= require ./app/survey_groups/show.controller
//= require ./app/survey_groups/show.directive
//= require ./app/survey_groups/form.directive
//= require ./app/survey_groups/db.form.directive
//= require ./app/survey_groups/survey.group.factory
//= require ./app/survey_groups/survey.group.service
//= require ./app/survey_groups/pouch.key.factory
//= require ./app/survey_groups/pouch.key.service

//= require ./app/languages/language.module
//= require ./app/languages/language.factory
//= require ./app/languages/language.service
//= require ./app/languages/language.directive

//= require ./app/survey_families/survey.family.module
//= require ./app/survey_families/form.directive
//= require ./app/survey_families/list.item.directive
//= require ./app/survey_families/show.directive
//= require ./app/survey_families/survey.family.factory
//= require ./app/survey_families/survey.family.service

//= require ./app/surveys/survey.module
//= require ./app/surveys/show.controller
//= require ./app/surveys/show.directive
//= require ./app/surveys/form.directive
//= require ./app/surveys/clone.form.directive
//= require ./app/surveys/survey.factory
//= require ./app/surveys/survey.service
//= require ./app/surveys/schema.factory

//= require ./app/sections/section.module
//= require ./app/sections/show.controller
//= require ./app/sections/show.directive
//= require ./app/sections/form.directive
//= require ./app/sections/list.item.directive
//= require ./app/sections/section.factory
//= require ./app/sections/section.service

//= require ./app/questions/question.module
//= require ./app/questions/show.directive
//= require ./app/questions/form.directive
//= require ./app/questions/list.item.directive
//= require ./app/questions/question.factory
//= require ./app/questions/question.service
//= require ./app/questions/question.attribute.factory
//= require ./app/questions/question.attribute.service
//= require ./app/questions/question.category.factory
//= require ./app/questions/question.option.factory
//= require ./app/questions/question.option.service
//= require ./app/questions/custom.option.directive
//= require ./app/questions/grid.directive

//= require ./app/question_types/question.type.module
//= require ./app/question_types/index.controller
//= require ./app/question_types/question.type.factory
//= require ./app/question_types/question.type.service
//= require ./app/question_types/form.directive
//= require ./app/question_types/show.directive
//= require ./app/question_types/list.item.directive

//= require ./app/translations/translation.module
//= require ./app/translations/index.controller
//= require ./app/translations/translation.factory
//= require ./app/translations/translation.directive

//= require ./app/choice_lists/choice.list.module
//= require ./app/choice_lists/choice.list.factory
//= require ./app/choice_lists/choice.list.service
//= require ./app/choice_lists/form.directive
//= require ./app/choice_lists/show.directive
//= require ./app/choice_lists/list.item.directive

//= require ./app/help/index.controller
