import React from 'react';
import PropTypes from 'prop-types';

class InfiniteScroll extends React.Component {
    constructor(props) {
        super(props);

        this.isFetching = false;
        this.domElement = null;
        this.handleScrolling = this.handleScrolling.bind(this);
    }

    componentDidMount() {
        this.attachScrollHandler();
        this.handleScrolling();
    }

    componentDidUpdate() {
        this.handleScrolling();
    }

    componentWillUnmount() {
        this.detachScrollHandler();
    }

    handleScrolling() {
        if (!this.domElement || this.isFetching || !this.props.hasMoreData) {
            return;
        }

        // Height of the loaded but unread area. Fetch will be triggered once this value is below threshold.
        const unseenAreaHeight = this.domElement.scrollHeight - this.domElement.scrollTop - this.domElement.clientHeight;

        if (unseenAreaHeight < this.props.threshold) {
            this.isFetching = true;
            this.props.fetch()
                .then(() => {
                    this.completeFetch();
                    this.handleScrolling();
                })
                .catch(error => {
                    this.completeFetch();
                    if (this.props.onError) {
                        this.props.onError(error);
                    } else {
                        throw error;
                    }
                });
        }
    }

    completeFetch() {
        this.isFetching = false;
    }

    attachScrollHandler() {
        this.domElement.addEventListener('scroll', this.handleScrolling);
        this.domElement.addEventListener('resize', this.handleScrolling);
    }

    detachScrollHandler() {
        this.domElement.removeEventListener('scroll', this.handleScrolling);
        this.domElement.removeEventListener('resize', this.handleScrolling);
    }

    render() {
        return (
            <div className={this.props.className} ref={element => { this.domElement = element; }}>
                { this.props.children }
            </div>
        );
    }
}

InfiniteScroll.propTypes = {
    fetch: PropTypes.func.isRequired,
    hasMoreData: PropTypes.bool.isRequired,
    threshold: PropTypes.number.isRequired,
    className: PropTypes.string,
    onError: PropTypes.func
};

InfiniteScroll.defaultProps = {
    hasMoreData: false,
    threshold: 200
};

export default InfiniteScroll;
