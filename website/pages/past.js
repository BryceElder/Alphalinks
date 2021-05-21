import moment from "moment";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import ItemsList from "../components/itemsList.js";

import getRankedItemsByDay from "../api/items/getRankedItemsByDay.js";

export default function Past({
    items,
    authUserData,
    day,
    page,
    isMore,
    getDataError,
    invalidDateError,
    goToString,
}) {
    const renderGoBackwardLinks = () => {
        const backOneDay = moment(day).subtract(1, "day").format("YYYY-MM-DD");
        const backOneMonth = moment(day)
            .subtract(1, "month")
            .format("YYYY-MM-DD");
        const backOneYear = moment(day)
            .subtract(1, "year")
            .format("YYYY-MM-DD");

        return (
            <>
                <span>Go back a </span>
                <span>
                    <a href={`/past?day=${backOneDay}`}>day</a>,{" "}
                </span>
                <span>
                    <a href={`/past?day=${backOneMonth}`}>month</a>,{" "}
                </span>
                <span>
                    or <a href={`/past?day=${backOneYear}`}>year</a>.{" "}
                </span>
            </>
        );
    };

    const renderGoForwardLinks = () => {
        const differenceInDays = moment()
            .startOf("day")
            .diff(moment(day), "days");

        const forwardOneDay = moment(day).add(1, "day").format("YYYY-MM-DD");
        const forwardOneMonth = moment(day)
            .add(1, "month")
            .format("YYYY-MM-DD");
        const forwardOneYear = moment(day).add(1, "year").format("YYYY-MM-DD");

        if (differenceInDays >= 365) {
            return (
                <span>
                    Go forward a <a href={`/past?day=${forwardOneDay}`}>day</a>,{" "}
                    <a href={`/past?day=${forwardOneMonth}`}>month</a> or{" "}
                    <a href={`/past?day=${forwardOneYear}`}>year</a>.
                </span>
            );
        } else if (differenceInDays >= 30) {
            return (
                <span>
                    Go forward a <a href={`/past?day=${forwardOneDay}`}>day</a>{" "}
                    or <a href={`/past?day=${forwardOneMonth}`}>month</a>.
                </span>
            );
        } else if (differenceInDays > 0) {
            return (
                <span>
                    Go forward a <a href={`/past?day=${forwardOneDay}`}>day</a>.
                </span>
            );
        } else {
            return null;
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title={
                    !invalidDateError
                        ? `${day} Top Items | HeckarNews`
                        : "HeckarNews"
                }
            />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                label={!invalidDateError && !getDataError ? day : null}
            />
            <div className="items-list-content-container">
                {!getDataError && !invalidDateError ? (
                    <>
                        <div className="past-items-top-header">
                            <span>
                                Stories from{" "}
                                {moment(day).format("MMMM D, YYYY")}, ordered by
                                highest point scores.
                            </span>
                        </div>
                        <div className="past-items-bottom-header">
                            {renderGoBackwardLinks()}
                            {renderGoForwardLinks()}
                        </div>
                        <ItemsList
                            items={items}
                            goToString={goToString}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            showHideOption={true}
                            showRank={true}
                            isMoreLink={`past?day=${day}&page=${page + 1}`}
                            isMore={isMore}
                        />
                    </>
                ) : (
                    <div className="items-list-error-msg">
                        {invalidDateError ? (
                            <span>Invalid day.</span>
                        ) : (
                            <span>An error occured.</span>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const day = query.day
        ? query.day
        : moment().subtract(1, "day").format("YYYY-MM-DD");
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getRankedItemsByDay(day, page, req);
    // console.log(apiResult);

    return {
        props: {
            items: (apiResult && apiResult.items) || [],
            authUserData:
                apiResult && apiResult.authUser ? apiResult.authUser : {},
            day: day,
            page: page || 1,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            invalidDateError:
                (apiResult && apiResult.invalidDateError) || false,
            goToString:
                page > 1 ? `past?day=${day}&page=${page}` : `past?day=${day}`,
        },
    };
}