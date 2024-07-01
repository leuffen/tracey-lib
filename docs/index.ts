import "../index";
import {SectionTracker} from "../src/tracker/section-tracker";


console.log("index.ts loaded");
(()=> {
    console.log("DOM loaded");
    const st = new SectionTracker("section", 50, (section, data) => {
        console.log(`Section ${data.sectionName} has been viewed for ${data.totalViewTime}ms`, data);
    });

})();
