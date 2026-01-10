// src/pages/compliance-dashboard/components/RecentActivity.jsx
import React from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import PropTypes from "prop-types";

/**
 * RecentActivity — simple presentational list.
 * Accepts `items` array. If empty, shows placeholder.
 */

export default function RecentActivity({ items = [], onViewAll }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
      </div>

      <div className="space-y-4">
        {items?.length ? items.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="p-2 bg-muted/30 rounded-lg">
              <Icon name={activity.icon} size={14} className={activity.color} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground">{activity.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
              <span className="text-xs text-muted-foreground mt-1 block">{activity.timeLabel}</span>
            </div>
          </div>
        )) : (
          <div className="text-center py-6">
            <Icon name="Search" size={40} className="text-muted-foreground mx-auto mb-3" />
            <div className="text-sm text-muted-foreground">No recent activity</div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" iconName="ArrowRight" iconPosition="right" fullWidth onClick={onViewAll}>
          View All Activity
        </Button>
      </div>
    </div>
  );
}

RecentActivity.propTypes = {
  items: PropTypes.array,
  onViewAll: PropTypes.func
};
