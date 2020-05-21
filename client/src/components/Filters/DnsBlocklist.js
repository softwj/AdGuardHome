import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PageTitle from '../ui/PageTitle';
import Card from '../ui/Card';
import Modal from './Modal';
import Actions from './Actions';

import Table from './Table';
import { MODAL_TYPE } from '../../helpers/constants';

import {
    enrichWithKey,
    flattenObject,
    getCurrentFilter,
    getObjDiff,
} from '../../helpers/helpers';

const filtersCatalog = require('../../../../filters');

export const normalizeFiltersCatalog = (filtersCatalog) => {
    const allFilters = flattenObject(filtersCatalog);
    return enrichWithKey(allFilters);
};

const normalizedFiltersCatalog = normalizeFiltersCatalog(filtersCatalog);

class DnsBlocklist extends Component {
    componentDidMount() {
        this.props.getFilteringStatus();
    }

    handleSubmit = (values, _, three) => {
        const { initialValues } = three;
        const { filtering: { modalFilterUrl, modalType } } = this.props;

        switch (modalType) {
            case MODAL_TYPE.EDIT_FILTERS:
                this.props.editFilter(modalFilterUrl, values);
                break;
            case MODAL_TYPE.ADD_FILTERS: {
                const { name, url } = values;
                this.props.addFilter(url, name);
                break;
            }
            case MODAL_TYPE.CHOOSE_FILTERING_LIST: {
                const changedValues = getObjDiff(initialValues, values);

                Object.entries(changedValues)
                    .forEach(([name, shouldAddFilter]) => {
                        const url = normalizedFiltersCatalog[name].source;

                        if (shouldAddFilter) {
                            this.props.addFilter(url, name);
                        } else {
                            this.props.removeFilter(url);
                        }
                    });
                break;
            }
            default:
                break;
        }
    };

    handleDelete = (url) => {
        if (window.confirm(this.props.t('list_confirm_delete'))) {
            this.props.removeFilter(url);
        }
    };

    toggleFilter = (url, data) => {
        this.props.toggleFilterStatus(url, data);
    };

    handleRefresh = () => {
        this.props.refreshFilters({ whitelist: false });
    };

    openSelectTypeModal = () => {
        this.props.toggleFilteringModal({ type: MODAL_TYPE.SELECT_MODAL_TYPE });
    };

    render() {
        const {
            t,
            toggleFilteringModal,
            addFilter,
            filtering: {
                filters,
                isModalOpen,
                isFilterAdded,
                processingRefreshFilters,
                processingRemoveFilter,
                processingAddFilter,
                processingConfigFilter,
                processingFilters,
                modalType,
                modalFilterUrl,
            },
        } = this.props;
        const currentFilterData = getCurrentFilter(modalFilterUrl, filters);
        const loading = processingConfigFilter
            || processingFilters
            || processingAddFilter
            || processingRemoveFilter
            || processingRefreshFilters;

        return (
            <Fragment>
                <PageTitle
                    title={t('dns_blocklists')}
                    subtitle={t('dns_blocklists_desc')}
                />
                <div className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <Card subtitle={t('filters_and_hosts_hint')}>
                                <Table
                                    filters={filters}
                                    loading={loading}
                                    processingConfigFilter={processingConfigFilter}
                                    toggleFilteringModal={toggleFilteringModal}
                                    handleDelete={this.handleDelete}
                                    toggleFilter={this.toggleFilter}
                                />
                                <Actions
                                    handleAdd={this.openSelectTypeModal}
                                    handleRefresh={this.handleRefresh}
                                    processingRefreshFilters={processingRefreshFilters}
                                />
                            </Card>
                        </div>
                    </div>
                </div>
                <Modal
                    filtersCatalog={filtersCatalog}
                    normalizedFiltersCatalog={normalizedFiltersCatalog}
                    filters={filters}
                    isOpen={isModalOpen}
                    toggleFilteringModal={toggleFilteringModal}
                    addFilter={addFilter}
                    isFilterAdded={isFilterAdded}
                    processingAddFilter={processingAddFilter}
                    processingConfigFilter={processingConfigFilter}
                    handleSubmit={this.handleSubmit}
                    modalType={modalType}
                    currentFilterData={currentFilterData}
                />
            </Fragment>
        );
    }
}

DnsBlocklist.propTypes = {
    getFilteringStatus: PropTypes.func.isRequired,
    filtering: PropTypes.object.isRequired,
    removeFilter: PropTypes.func.isRequired,
    toggleFilterStatus: PropTypes.func.isRequired,
    addFilter: PropTypes.func.isRequired,
    toggleFilteringModal: PropTypes.func.isRequired,
    handleRulesChange: PropTypes.func.isRequired,
    refreshFilters: PropTypes.func.isRequired,
    editFilter: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default withTranslation()(DnsBlocklist);
